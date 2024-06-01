//CRIAR UMA CLASSE OU MODULO PARA GERIR FORMULARIOS BUTÕES E MENUS
//users.menu.create(), users.forms.addUser(), users.forms.login()
//alterar a palavra menu para container
import {jwtDecode} from 'jwt-decode';
import {createElementWithAttributes, createButton, createForm, newPopUpMessage} from './formUtils.js';
import {database} from './databaseUtils.js';
export const users = (function(){
    const usersMenuContainer = document.getElementById('usersMenuContainer');
    const editUserButton = createButton('Edit User', 'editUserButton', ['fa-user-edit'] ,["formButton"],() => {   
        /*editar utilizador */  
    });
    const deleteUserButton = createButton('Delete Account', 'deleteUserButton', ['fa-trash-alt'],["formButton"], () => {    
        createForm('deleteUserFormContainer', 'deleteUserForm', 'Delete Account?', null, 'Yes, Delete', 
        async function (event){
            event.preventDefault();
            await users.delete();
            document.getElementById('deleteUserFormContainer').remove();
            newPopUpMessage("Utilizador removido com sucesso!", "success");
        });    
    });
    const signoutButton = createButton('Log Out', 'logoutButton', ['fa-sign-out-alt'],["formButton"], () => {
        createForm('logOutUserFormContainer', 'logOutUserForm', 'Log Out ?', null, 'Yes, Log Out', 
        function (event){
            event.preventDefault();
            users.logout();
            document.getElementById('logOutUserFormContainer').remove();
            
        });     
    });
    const menu = {
        create: () => {
            usersMenuContainer.innerHTML = '';
            const currentUserDisplay = createElementWithAttributes('div', {id:'currentUserDisplay', innerText:'No User Logged In'});
            const addUserButton = createButton('Sign Up', 'addUserButton', ["fa-user-plus"],["formButton"],() => {
                createForm('addUserFormContainer', 'addUserForm', 'Add a New User', [
                    { type: 'text', id: 'addName', placeholder: 'Name', autocomplete: 'username' },
                    { type: 'password', id: 'addPassword', placeholder: 'Password', autocomplete: 'new-password' }
                ], 'Add User', async function (event){
                    event.preventDefault();
                    let name = document.getElementById('addName').value;
                    let password = document.getElementById('addPassword').value;
                    try{
                        await users.add(name, password);
                        newPopUpMessage(`${name} adicionado com sucesso.`);
                    }catch(error){
                        newPopUpMessage(error);
                    }
                    document.getElementById('addUserFormContainer').remove();
                });
            });
            const loginUserButton = createButton('Login', 'loginUserButton', ['fa-sign-in-alt'],["formButton"], () => {
                createForm('loginUserFormContainer', 'loginUserForm', 'Log In', [
                    { type: 'text', id: 'userName', placeholder:"Username",  },
                    { type: 'password', id: 'userPassword', placeholder:"Password"}], 'Log In', 
                async function (event){
                    event.preventDefault();
                    let name = document.getElementById('userName').value;
                    let password = document.getElementById('userPassword').value;
                    await users.login(name, password);
                    document.getElementById('loginUserFormContainer').remove();
                    
                });    
            });
            usersMenuContainer.append(currentUserDisplay, addUserButton, loginUserButton);
            
        }
    }
    //public interface
    return {
        menu:menu,
        addUserForm: "",
        logout: () => {
            localStorage.removeItem('user'); 
            document.getElementById("currentUserDisplay").innerText = "No User"; 
            usersMenuContainer.remove(editUserButton, deleteUserButton, signoutButton);
            window.eventBus.emit("users:logoutUser", {user_id: users.getCurrent()});
        },
        login: async (name, password) => {
            let user_token = await database.get( "user", "login/", {name:name, password:password});
            localStorage.setItem("user", user_token);
            window.eventBus.emit("users:loginUser", {user_id: users.getCurrent()}); 
            document.getElementById("currentUserDisplay").innerText = name;
            usersMenuContainer.append(editUserButton, deleteUserButton, signoutButton); 
        },
        add: async (name, password) => {
            const new_user = await database.add("user", "add_user/", {name:name, password: password});
            window.eventBus.emit("users:addUser", {user_id: new_user.id}); 
        },
        edit: (id, name, password) => {
            window.eventBus.emit("users:editUser", {id: id, name:name, password:password}); 
            //depois de editar o utilizador fazer login com o novo nome e password
        },
        delete: async () => {
            await database.delete("User", "delete_user/", users.getCurrent());
            window.eventBus.emit("users:deleteUser", {id: users.getCurrent()});
            users.logout();
        },
        getCurrent: () => {
           return jwtDecode(localStorage.getItem('user').id);
        }
    }
})();