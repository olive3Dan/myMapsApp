//Como implementar a partilha de projetos entre os utilizadores?
import { createElementWithAttributes, createContextMenu, newPopUpMessage, createForm, createButton } from './formUtils.js';
import {database} from './databaseUtils.js'
export const projects = (function(){
    //private variables and functions
    let current_user = null;
    window.eventBus.on('users:loginUser', (event) => {
        if(current_user) projects.menu.remove();
        projects.menu.create();
        current_user = event.user_id;
    });
    window.eventBus.on('users:logoutUser', (event) => {
        projects.close();
        projects.menu.remove();
        current_user = null;
    });
    let current_project = null;
    const project_container_id = 'project-container';
    let projectDescription = createElementWithAttributes("span", {id:"project-description", innerHTML:"no description", class:"project-description"});
    let projectLabel = createElementWithAttributes("div", {innerHTML:"No Project", id:"project-label"});
    const forms = {
        openProject: async () => {
            let projects_data;
            projects_data = await projects.load(current_user);
            console.log(projects_data)
            let project_select_options = [];
            projects_data.forEach(function(project) {
                project_select_options.push({value: project.id, text: project.name});
            });
            createForm("open-projects-form-container", "open-project-form", "Open Project", [
                {type: 'select', options:project_select_options, id: 'select-project', label:"Select Project", placeholder: 'select a project', autocomplete: 'project name' },
                ],"Open Project", 
                function(event){
                    event.preventDefault();
                    const project_id = document.getElementById('select-project').value;
                    projects.open(project_id);
                    document.getElementById('open-projects-form-container').remove();
                }
            );
        },
        addProject: () => { 
            createForm("add-projects-form-container", "add-project-form", "Add Project", [ 
                { type: 'text', id: 'add-project', placeholder: 'project name', autocomplete: 'project name' }],"Add Project", 
                async function(event){
                    event.preventDefault();
                    let project_name = document.getElementById('add-project').value;
                    const project_id = await projects.add(current_user, project_name);
                    document.getElementById('add-projects-form-container').remove();
                    if(!project_id){
                        newPopUpMessage("Erro ao adicinar projeto");
                        return;
                    }
                    await projects.open(project_id);
                }
            )
        },
        deleteProject: () => {
            createForm('delete-project-form-container', 'delete-project-form', 'Delete Project?', [], 'Yes, Delete', 
                async function (event){
                    event.preventDefault();
                    let project_id = current_project;
                    const deleted_project = await projects.delete(project_id);
                    if(!deleted_project){
                        newPopUpMessage("Impossivel eliminar projeto");
                    }
                    document.getElementById('delete-project-form-container').remove();
                }
            )
        },
        shareProject:() => {}
    };
    const menu = {
        create: () => {
            const project_container = createElementWithAttributes('div', {id: project_container_id, class:'project-container'});
            let projectLabelContainer = createElementWithAttributes("div", {id:"project-label-container"});
            let contextMenuButton = createButton("","projects-context-menu-button", ['fa-bars'], ['context-menu-button'], async () => {
                const menu_items = []
                if(current_user){
                    menu_items.push( { label: 'New Project', iconClasses: ['fa-solid', 'fa-folder-plus'], onClick: () => {projects.forms.addProject()}});
                }   
                if(await projects.load(current_user)){
                    menu_items.push( { label: 'Open Project', iconClasses: ['fa-regular','fa-folder-open'], onClick: () => {projects.forms.openProject()}},);
                }
                if(current_project){
                    menu_items.push(
                        { label: 'Rename Project', iconClasses:['fa-solid','fa-pen-to-square'], onClick: () =>{}},
                        { label: 'Properties', iconClasses:['fa-regular','fa-rectangle-list'], onClick: () => window.eventBus.emit('properties:openPropertiesMenu', {})},
                        { label: 'Styles', iconClasses:['fa-solid','fa-palette'], onClick: () => window.eventBus.emit('styles:openStylesMenu', {})},
                        { label: 'Delete Project', iconClasses: ['fa-solid', 'fa-trash'], onClick: () => projects.forms.deleteProject(current_project)}
                    );
                }
                createContextMenu(contextMenuButton, menu_items, 'bottom-right');
            }); 
            projectLabelContainer.append(projectLabel, contextMenuButton);
            project_container.append(projectLabelContainer, projectDescription);
            document.body.append(project_container);
            
            
            
        },
        remove: ()=> {
            const projectContainer = document.getElementById(project_container_id);
            
            if (projectContainer) {
                console.log("Container exists:", projectContainer);
                document.body.removeChild(projectContainer);
                console.log("Container removed:", projectContainer);
            } else {
                console.error("Failed to remove: Container does not exist");
            }
        },
    };
    //public interface
    return {
        open: async (project_id) => {
            if(current_project) projects.close();
            const project = await database.load("Get Project", `project/${project_id}`);
            current_project = project.id;
            projectLabel.innerHTML = project.name;
            projectDescription.innerHTML = "descrição sumaria do projeto...";
            console.log("OPEN PROJECT ID " + project_id);
            window.eventBus.emit("projects:openProject", {project_id: project_id});
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
            window.eventBus.emit("projects:closeProject",{});
        },
        add: async (user_id, project_name) => {
            if(!project_name) return null;
            let new_project;
            try{
                new_project = await database.add("project", "add_project/", {name: project_name} );
                await database.add("project user association", "associate_project_user/", {project_id: new_project.id, user_id: user_id});
            }catch(error){
                return null;
            }
            window.eventBus.emit("projects:addProject",{project_id: new_project.id});
            return new_project.id;
        },
        edit:()=>{},
        delete: async (project_id) => {
            try{
                await database.delete("project", "delete_project/", project_id); 
            }catch(error){
                return null;
            }
            projects.close();
            window.eventBus.emit("projects:deleteProject",{project_id:project_id});
            return project_id;
        },
        menu: menu,
        forms: forms
    }
})();

