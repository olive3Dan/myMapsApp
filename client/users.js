//CRIAR UMA CLASSE OU MODULO PARA GERIR FORMULARIOS BUTÕES E MENUS
//users.menu.create(), users.forms.addUser(), users.forms.login()
//alterar a palavra menu para container
import {jwtDecode} from 'jwt-decode';
import { projects } from './projects.js';
import {createElementWithAttributes, createButton, createForm, newPopUpMessage} from './formUtils.js';
import {database} from './databaseUtils.js';
export const users = (function(){
    //private variables and functions
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
                    try{
                        await users.login(name, password);
                        projects.menu.remove();
                        projects.menu.create();
                    }catch(error){
                        console.log(error);
                    }
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
        logout:() => {
            localStorage.removeItem('user'); 
            document.getElementById("currentUserDisplay").innerText = "No User"; 
            usersMenuContainer.remove(editUserButton, deleteUserButton, signoutButton);
            projects.close();
            projects.menu.remove();
            
        },
        login: async (name, password) => {
            let user_token = await database.get( "user", "login/", {name:name, password:password});
            localStorage.setItem("user", user_token); 
            const user = users.getCurrent();
            document.getElementById("currentUserDisplay").innerText = user.name;
            usersMenuContainer.append(editUserButton, deleteUserButton, signoutButton); 
        },
        add: async (name, password) => {
            let user = await database.add("user", "add_user/", {name:name, password: password});
            console.log(user.password);
            console.log("Utilizador adicinado com sucesso", "success");
            return user;
        },
        edit:() => {
            //depois de editar o utilizador fazer login com o novo nome e password
        },
        delete: async () => {
            let current_user = users.getCurrent();
            users.logout();
            await database.delete("User", "delete_user/", current_user.id);
        },
        getCurrent: () => {
           return jwtDecode(localStorage.getItem('user'));
        }
    }
})();