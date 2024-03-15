import { newPopUpMessage } from "./popUpForms";
const server_url = "http://localhost:3000/";
// GENERIC
export async function loadFromDatabase(entity_name, end_point){
    try{
        const response = await fetch(server_url + end_point, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        if (response.ok) {
            return await response.json();
        }
        if (response.status === 404) {
            return null;
        } else {
            throw new Error(`Failed to load ${entity_name} from database`);
        }
    }catch(error){
        throw error;
    }
    
}
export async function getFromDataBase(values, url){
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
    });
    if (!response.ok) {
        throw new Error("Failed to login");
    }
    const result = await response.json();
    return result;
}
export async function addToDatabase(values, url){
    let request = JSON.stringify(values);
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: request
    });
    if (!response.ok) {
        throw new Error(`Failed to add ${values} to database`);
    }
    const result = await response.json();
    return result;
}
export async function updateEntityFromDatabase(entity_name, end_point, values) {
    let request = JSON.stringify(values);
    const response = await fetch(server_url + end_point, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: request
    });
    if (!response.ok) {
        throw new Error(`Failed to update ${entity_name} in the database`);
    }
    const result = await response.json();
    return result;
}
export async function deleteFromDatabase(url) {
    try {
        const response = await fetch(url, {
            method: 'DELETE',
        });
        return response.status;
    } catch (error) {
        throw new Error(error.message);
    }
}
export async function deleteEntityFromDatabase(entity_name, end_point, id ) {
    
    const response = await fetch(server_url + end_point + id, {
        method: 'DELETE',
    });
    if (response.ok) {
        return response.status;
    } else if (response.status === 404) {
        throw new Error(`${entity_name} not found in the database`);
    } else {
        throw new Error(`Failed to delete ${entity_name} from the database`);
    }
    
}
export async function addEntityToDatabase(entity_name, end_point, values){
    let request = JSON.stringify(values);
    const response = await fetch(server_url + end_point, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: request
    });
    if (!response.ok) {
        throw new Error(`Failed to add ${entity_name} to database`);
    }
    const result = await response.json();
    return result;
    
}

//USERS
export async function addUserToDatabase(name, password){
    try{
        return await addToDatabase({name: name, password:password, group_id:7}, 'http://localhost:3000/add_user');
    }catch(error){
        throw error;
    } 
}
export async function getUserFromDatabase(name, password) {
    try {
        return await getFromDataBase({ name: name, password: password }, `http://localhost:3000/get_user`);
    } catch (error) {
        throw error;
    }
}
export async function deleteUserFromDatabase(user){
    try {
        const response_status = await deleteFromDatabase({}, `http://localhost:3000/${user.id}`);
        if (response_status == 204) {
            console.log(`User ${user.id} deleted successfully from database`);
            return response_status;
        } else if(response_status == 404){
            throw new Error(`User ${user.id} not found in database`);
        }
        else{
            throw new Error(`User ${user.id} not deleted from database, unknown error`);    
        }
    } catch (error) {
        throw error;
    }
}

//PROJECTS
export async function deleteProjectFromDatabase(project_id) {
    deleteFromDatabase(`http://localhost:3000/delete_project/${project_id}`)
    .then(response_status=>{
        if (response_status == 204) {
            console.log(`Project ${project_id} deleted successfully from database`);
        } else if(response_status == 404){
            console.error(`Project ${project_id} not found in database`);
            throw new Error(`Project ${project_id} not found in database`);
        }
        else{
            console.error(`Project ${project_id} not deleted from database, unknown error`);
            throw new Error(`Project ${project_id} not deleted from database, unknown error`);    
        }
    })
    .catch(error=>{
        console.error(error);
        throw error;
    });
}

//PROJECTS_USERS ASSOCIATIONS

export async function deleteProjectUserAssociation(project_id, user_id){
    deleteFromDatabase({project_id:project_id, user_id:user_id}, `/delete_project_user_association/${project_id}/${user_id}`)
    .then(association => {
       console.log(`PROJECT: ${association.project_id} <=> USER: ${association.user_id} ASSOCIATED`);
    })
    .catch(error => {
        console.error(error);
        throw error;
    });      
}
//LAYERS
//POINTS
//PROPERTIES
//POINTS_PROPERTIES

