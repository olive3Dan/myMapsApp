import {jwtDecode} from 'jwt-decode';
import {createElementWithAttributes, createButton, createForm, newPopUpMessage} from './formUtils.js';
import {database} from './databaseUtils.js';
export const users = (function(){
    const usersMenuContainer = document.getElementById('usersMenuContainer');
    const editUserButton = createButton('Edit User', 'editUserButton', ['fa-user-edit'] ,["formButton"],() => {   
       
    });
    const deleteUserButton = createButton('Delete Account', 'deleteUserButton', ['fa-trash-alt'],["formButton"], () => {    
        createForm('delete-user-form-container', 'deleteUserForm', 'Delete Account?', [], 'Yes, Delete', 
        async function (event){
            event.preventDefault();
            const delete_status = await users.delete();
            if(!delete_status) {
                newPopUpMessage("Não foi possivel Eliminar o utilizador atual");
                return;
            }
            document.getElementById('delete-user-form-container').remove();
            newPopUpMessage("Utilizador removido com sucesso!", "success");
        });    
    });
    const signoutButton = createButton('Log Out', 'logoutButton', ['fa-sign-out-alt'],["formButton"], () => {
        createForm('logOutUserFormContainer', 'logOutUserForm', 'Log Out ?', [], 'Yes, Log Out', 
        function (event){
            event.preventDefault();
            users.logout();
            document.getElementById('logOutUserFormContainer').remove();  
        });     
    });
    const forms = {
        login: async () => {
            createForm('loginUserFormContainer', 'loginUserForm', 'Log In', [
                { type: 'text', id: 'userName', placeholder:"Username", autocomplete:"username"  },
                { type: 'password', id: 'userPassword', placeholder:"Password", autocomplete:"password"}], 'Log In', 
            async function (event){
                event.preventDefault();
                let name = document.getElementById('userName').value;
                let password = document.getElementById('userPassword').value;
                const user = await users.login(name, password);
                if(!user){
                    newPopUpMessage("Utilizador ou password invalidas!");
                    return;
                }
                document.getElementById('loginUserFormContainer').remove();
            });    
        }
    }
    const menu = {
        create: () => {
            usersMenuContainer.innerHTML = '';
            const currentUserDisplay = createElementWithAttributes('div', {id:'currentUserDisplay', innerText:'No User Logged In'});
            const addUserButton = createButton('Sign Up', 'addUserButton', ["fa-user-plus"],["formButton"],() => {
                createForm('addUserFormContainer', 'addUserForm', 'Add a New User', [
                    { type: 'text', id: 'addName', placeholder: 'Name' },
                    { type: 'password', id: 'addPassword', placeholder: 'Password' }
                ], 'Add User', async function (event){
                    event.preventDefault();
                    let name = document.getElementById('addName').value;
                    let password = document.getElementById('addPassword').value;
                    const new_user = await users.add(name, password);
                    if(!new_user) {
                        newPopUpMessage("Nome e passwor dnão podem ser nulos.");
                        return;
                    }
                    newPopUpMessage(`${name} adicionado com sucesso.`);
                    document.getElementById('addUserFormContainer').remove();
                    users.forms.login();

                });
            });
            const loginUserButton = createButton('Login', 'loginUserButton', ['fa-sign-in-alt'],["formButton"], () => users.forms.login());
            usersMenuContainer.append(currentUserDisplay, addUserButton, loginUserButton);
        }
    }
    //public interface
    return {
        menu:menu,
        forms:forms,
        logout: () => {
            window.eventBus.emit("users:logoutUser", {user_id: users.getCurrent()});
            localStorage.removeItem('user'); 
            document.getElementById("currentUserDisplay").innerText = "No User"; 
            usersMenuContainer.removeChild(editUserButton);
            usersMenuContainer.removeChild(deleteUserButton);
            usersMenuContainer.removeChild(signoutButton);
           
        },
        login: async (name, password) => {
            let user_token = null;
            try{
                user_token = await database.get( "user", "login/", {name:name, password:password});
            }catch(error){
                return null;
            }
            localStorage.setItem('user', user_token);
            window.eventBus.emit('users:loginUser', {user_id: users.getCurrent()}); 
            document.getElementById('currentUserDisplay').innerText = name;
            usersMenuContainer.append(deleteUserButton, signoutButton);
            return users.getCurrent(); 
        },
        add: async (name, password) => {
            if(!(name || password)){
                return null
            }
            const new_user = await database.add("user", "add_user/", {name:name, password: password});
            window.eventBus.emit("users:addUser", {user_id: new_user.id});
            return new_user; 
        },
        edit: (id, name, password) => {
            window.eventBus.emit("users:editUser", {id: id, name:name, password:password}); 
            //depois de editar o utilizador fazer login com o novo nome e password
        },
        delete: async () => {
            const status = await database.delete("User", "delete_user/", users.getCurrent());
            if(!status) return null;
            window.eventBus.emit("users:deleteUser", {id: users.getCurrent()});
            users.logout();
            return status;
        },
        getCurrent: () => {
           return jwtDecode(localStorage.getItem('user')).id;
        }
    }
})();