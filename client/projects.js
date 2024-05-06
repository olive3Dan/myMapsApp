//Como implementar a partilha de projetos entre os utilizadores?
import{users} from './users.js';
import { loadLayers, unloadLayers, addLayer } from './main';
import { createElementWithAttributes, createContextMenu, newPopUpMessage, createForm, createButton } from './formUtils.js';
import {database} from './databaseUtils.js'
import { createLayersMenu, createPropertyMenu, createStylesMenu, removeLayersMenu } from './menus.js';
export const projects = (function(){
    //private variables and functions
    let current_project = null;
    let projectContainer = document.getElementById("project-container");
    let projectDescription = createElementWithAttributes("span", {id:"project-description", innerHTML:"no description", class:"project-description"});
    let projectLabel = createElementWithAttributes("div", {innerHTML:"No Project", id:"project-label"});
    const forms = {
        openProject: async () => {
            let projects_data;
            projects_data = await projects.load(users.getCurrent().id);
            let project_select_options = [];
            projects_data.forEach(function(project) {
                project_select_options.push({value: project, text: project.name});
            });
            createForm("open-projects-form-container", "open-project-form", "Open Project", [
                {type: 'select', options:project_select_options, id: 'select-project', label:"Select Project", placeholder: 'select a project', autocomplete: 'project name' },
                ],"Open Project", 
                function(event){
                    event.preventDefault();
                    let selected_project = JSON.parse(document.getElementById('select-project').value);
                    projects.open(selected_project);
                    document.getElementById('open-projects-form-container').remove();
                }
            );
        },
        addProject: () => { 
            createForm("add-projects-form-container", "add-project-form", "Add Project", [ 
                { type: 'text', id: 'addProject', placeholder: 'project name', autocomplete: 'project name' }],"Add Project", 
                async function(event){
                    event.preventDefault();
                    let project_name = document.getElementById('addProject').value;
                    let user_id = users.getCurrent().id;
                    await projects.add(user_id, project_name);
                    document.getElementById('add-projects-form-container').remove();
                }
            )
        },
        deleteProject: () => {
            createForm('delete-project-form-container', 'delete-project-form', 'Delete Project?', null, 'Yes, Delete', 
                async function (event){
                    event.preventDefault();
                    let project_id = current_project.id;
                    if(!project_id) throw new Error("No current project to delete");
                    await projects.delete(project_id);
                    document.getElementById('delete-project-form-container').remove();
                }
            )
        },
        shareProject:() => {}
    };
    const menu = {
        create: () => {
           let projectLabelContainer = createElementWithAttributes("div", {id:"project-label-container"});
            let contextMenuButton = createButton("","projects-context-menu-button", ['fa-bars'], ['context-menu-button'], async () => {
                const menu_items = [
                   { label: 'New Project', iconClasses: ['fa-solid', 'fa-folder-plus'], onClick: () => {projects.forms.addProject()}},
                ];
                if(await projects.load(users.getCurrent().id)){
                    menu_items.push( { label: 'Open Project', iconClasses: ['fa-regular','fa-folder-open'], onClick: () => {projects.forms.openProject()}},);
                }
                if(current_project){
                    menu_items.push(
                        { label: 'Rename Project',iconClasses:['fa-solid','fa-pen-to-square'], onClick: () =>{}},
                        { label: 'Delete Project',iconClasses: ['fa-solid', 'fa-trash'], onClick: () => {projects.forms.deleteProject()}}
                    );
                }
                createContextMenu('projects-context-menu-button', menu_items);
                    
            }); 
            projectContainer.append(projectLabelContainer, projectDescription);
            projectLabelContainer.append(projectLabel, contextMenuButton);
            
        },
        remove: ()=> {
            projects.close();
            projectContainer.remove()
        },
    };
    //public interface
    return {
        getCurrent:() => {return current_project},
        open: (project) => {
            projects.close();
            current_project = project;
            projectLabel.innerHTML = current_project.name;
            projectDescription.innerHTML = "descrição sumaria do projeto...";
            createLayersMenu();
            loadLayers(current_project.id);
        },
        load: async (user_id) => {
            try{
                return await database.load("Projects", `projects/${user_id}`);
            }catch(error){
                return null; 
            }
        },
        close:() => {
            if (!current_project) return;
            current_project = null;
            projectLabel.innerHTML = "NO PROJECT";
            removeLayersMenu(); 
        },
        add: async (user_id, project_name) => {
            const new_project = await database.add("project", "add_project/", {name: project_name} );
            await database.add("project user association", "associate_project_user/", {project_id: new_project.id, user_id: user_id});
            projects.open(new_project);
            await addLayer("Untitled Layer");
        },
        edit:()=>{},
        delete: async (project_id) => {
            projects.close()
           await database.delete("project", "delete_project/", project_id);
            console.log(`delete project${project_id}`);  
        },
        menu: menu,
        forms: forms
    }
})();

