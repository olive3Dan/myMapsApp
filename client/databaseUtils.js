//MELHORIAS NA FUNÇÃO load aquando de 404 not found throw an error
export const database = (function(){
    //private variables and functions
    const server_url = "http://localhost:3000/";
    //public interface  
    return{
        load: async function (entity_name, end_point){
            const response = await fetch(server_url + end_point, {
                method: "GET",
                headers: { "Content-Type": "application/json",
                           "authorization": `Bearer ${localStorage.getItem('user')}`    
                },
            });
            if (response.ok) {
                return await response.json();
            }
            if (response.status === 404) {
                throw new Error(`No ${entity_name} found`);
            } 
            if (response.status === 403){
                throw new Error(`User session ${localStorage.getItem('user').name} refused on ${entity_name} ${end_point}`);
            }
            throw new Error(`Failed to load ${entity_name} from database`);  
        },
        get: async function (entity_name, end_point, values){
            let request = JSON.stringify(values);
            const response = await fetch(server_url + end_point, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('user')}`    
                },
                body: request
            });
            if (response.ok) {
                return await response.json();
            }
            if (response.status === 404) {
                throw new Error(`No ${entity_name} found`);
            } 
            if (response.status === 403){
                throw new Error(`User session ${localStorage.getItem('user').name} refused on ${entity_name} ${end_point}`);
            }
            throw new Error(`Failed to load ${entity_name} from database`);
           
        },
        add: async function (entity_name, end_point, values){
            let request = JSON.stringify(values);
            const response = await fetch(server_url + end_point, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "authorization": `Bearer ${localStorage.getItem('user')}`     },
                body: request
            });
            if (response.ok) {
                return await response.json();
            }
            if (response.status === 403){
                throw new Error(`User session ${localStorage.getItem('user').name} refused on ${entity_name} ${end_point}`);
            }
            throw new Error(`Failed to load ${entity_name} from database`);
        },
        update: async function (entity_name, end_point, values) {
            let request = JSON.stringify(values);
            const response = await fetch(server_url + end_point, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "authorization": `Bearer ${localStorage.getItem('user')}`    
                },
                body: request
            });
            if (response.ok) {
                return await response.json();
            }
            if (response.status === 404) {
                throw new Error(`No ${entity_name} found`);
            } 
            if (response.status === 403){
                throw new Error(`User session ${localStorage.getItem('user').name} refused on ${entity_name} ${end_point}`);
            }
            throw new Error(`Failed to load ${entity_name} from database`);
        },
        delete: async function (entity_name, end_point, id ) {
            const response = await fetch(server_url + end_point + id, {
                method: 'DELETE',
                headers: { 
                    "authorization": `Bearer ${localStorage.getItem('user')}`    
                },
            });
            if (response.ok) {
                return response.status;
            }
            if (response.status === 404) {
                throw new Error(`No ${entity_name} found`);
            } 
            if (response.status === 403){
                throw new Error(`User session ${localStorage.getItem('user').name} refused on ${entity_name} ${end_point}`);
            }
            throw new Error(`Failed to load ${entity_name} from database`);
        }
    };
})();



