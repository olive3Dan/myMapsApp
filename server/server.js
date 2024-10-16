
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcript = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
require('dotenv').config();
const app = express();
const multer = require('multer');
const upload = multer();
const Buffer = require('buffer').Buffer;

let retryCount = 0;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

// Enable cross-origin resource sharing
app.use(cors());
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',//database se for
  database: 'geo_data',
  password: 'olive3Dan@pg',
  port: '5432',
});
const MAX_RETRIES = 10;
const RETRY_INTERVAL = 2000; // milliseconds
connectToDatabase();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.sendStatus(401); // Unauthorized
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403); // Forbidden
    }
    req.user = user; 
    next(); 
  });
};
function connectToDatabase() {
  pool.connect((err, client, done) => {
    if (err) {
      if (retryCount < MAX_RETRIES) {
        console.error('Error connecting to the database:', err.stack);
        console.log(`Retrying in ${RETRY_INTERVAL / 1000} seconds...`);
        retryCount++;
        setTimeout(connectToDatabase, RETRY_INTERVAL);
      } else {
        console.error('Max retries reached. Unable to connect to the database.');
        process.exit(1); // Exit the server if the maximum number of retries is reached
      }
    } else {
      console.log('Connected to the database :)');
      done();
    }
  });
}
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcript.hash(password, saltRounds);
};
const comparePasswords = async (plainPassword, hashedPassword) => {
  return await bcript.compare(plainPassword, hashedPassword);
};
//GROUPS
app.get("/groups", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM groups");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.put("/update_group/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "UPDATE groups SET name = $1 WHERE id = $2",
      [req.body.name, req.params.id]
    );
    res.status(200).json({ message: "Group updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.post("/add_group", async (req, res) => {
  try {
    const result = await pool.query(
      'INSERT INTO groups (name) VALUES($1) RETURNING *',
      [req.body.name]
    );
    console.log(result.rows[0]);
    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.delete("/delete_group/:id", async (req, res) => {
  try {
    console.log("DELETE " + req.params.id);
    const result = await pool.query("DELETE FROM groups WHERE id = $1", [
      req.params.id,
    ]);
    if (result.rowCount === 0) {
      res.status(404).json({ error: "group not found" });
    } else {
      res.status(204).send();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//USERS
app.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.status(200).json(result.rows);
    console.log("GET USERS")
    console.log(JSON.stringify(result.rows));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in user get" });
  }
});
app.post("/login", async (req, res) => {
  try {
    const {name, password} =  req.body;
    const result = await pool.query("SELECT * FROM users WHERE name = $1;", [name]);
    if (result.rowCount === 0) {
      console.log(`USER ${name} NOT FOUND`);
      return res.status(404).send(`USER ${name} NOT FOUND`);
    } 
    const user = result.rows[0];
    const passwordsMatch = await comparePasswords(password, user.password);
    if(!passwordsMatch){
      console.log(`PASSWORD DOES NOT MATCH FOR USER ${name}`);
      return res.status(401).send("Invalid credentials");
    }
    const token = jwt.sign(user, process.env.JWT_SECRET,{expiresIn: '1h'});
    console.log(`USER ${user.name} SUCCESSFULLY FOUND`);
    res.status(200).json(token);
    
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error in get_user");
  }
});
app.post("/add_user", async (req, res) => {
  try {
    const hashedPassword = await hashPassword(req.body.password);
    console.log(hashedPassword);
    const result = await pool.query(
      'INSERT INTO users (name, password, group_id) VALUES($1, $2, $3) RETURNING *',
      [req.body.name, hashedPassword, req.body.group_id]
    );
    console.log(result.rows[0]);
    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in user post" });
  }
});
app.put("/update_user/:id",authenticateToken, async (req, res) => {
  try {
    const hashedPassword = await hashPassword(req.body.password);
    const result = await pool.query(
      "UPDATE users SET name = $1, password = $2, group_id = $3 WHERE id = $4 RETURNING *;",
      [req.body.name, hashedPassword, req.body.group_id, req.params.id]
    );
    console.log("USER UPDATE: ");
    console.log(result.rows[0]);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in user put" });
  }
});
app.delete("/delete_user/:id",authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM users WHERE id = $1;", [
      req.params.id,
    ]);
    if (result.rowCount === 0) {
      console.log(`USER ${req.params.id} NOT FOUND`);
      res.status(404).send(`User ${req.params.id} not found :(`);
    } else {
      console.log(`USER ${req.params.id} DELETED SUCCESSFULLY`);
      res.status(204).send(`User ${req.params.id} deleted successfully :)`);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error in user delete");
  }
});

//PROJECTS
app.get("/projects/:user_id", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM projects
       INNER JOIN projects_users ON projects.id = projects_users.project_id
       WHERE projects_users.user_id = $1`,
    [req.params.user_id]);
    if (result.rowCount === 0) {
      console.log(`USER ${req.params.user_id} HAS NO PROJECTS`);
      res.status(404).send(`USER ${req.params.user_id} HAS NO PROJECTS`);
    } else {
      res.status(200).json(result.rows);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in projects get" });
  }
});
app.get("/project/:id", async (req, res) => {
  try {
    console.log("project id : " + req.params.id);
    const result = await pool.query(`SELECT * FROM projects WHERE id = $1;`,[req.params.id]);
    if (result.rowCount === 0) {
      res.status(404).send(`PROJECT ${req.params.id} NOT FOUND`);
    } else {
      res.status(200).json(result.rows[0]);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in projects get" });
  }
});
app.post("/add_project",authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'INSERT INTO projects (name) VALUES($1) RETURNING *',
      [req.body.name]
    );
    console.log(result.rows[0]);
    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in add_project" });
  }
});
app.put("/update_project/:id", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "UPDATE projects SET name = $1 WHERE id = $2 RETURNING *;",
      [req.body.name, req.params.id]
    );
    if (result.rowCount === 0) {
      console.log(`PROJECT ${req.params.id} NOT FOUND`);
      res.status(404).send(`PROJECT ${req.params.id} NOT FOUND`);
    } else {
      console.log(`PROJECT UPDATE: ${result.rows[0]}`);
      res.status(200).json(result.rows[0]);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in projects UPDATE" });
  }
  
});
app.delete("/delete_project/:id",authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM projects WHERE id = $1;", [
      req.params.id,
    ]);
    if (result.rowCount === 0) {
      const message = `PROJECT ${req.params.id} NOT FOUND`;
      console.log(message);
      res.status(404).send(message);
    } else {
      const message = `PROJECT ${req.params.id} DELETED SUCCESSFULLY`;
      console.log(message);
      res.status(204).send(message);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error in project delete");
  }
});

//PROJECTS_USERS
app.get("/projects_users_associations",authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM projects_users");
    if (result.rowCount === 0) {
      const message = `NO PROJEC USER ASSOCIATION FOUND`;
      console.log(message);
      res.status(404).send(message);
    } else {
      const message = `PROJECT USERS ASSOCIATIONS FOUND`;
      console.log(message);
      res.status(200).json(result.rows);
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in projects_users_associations get" });
  }
});
app.post("/associate_project_user",authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'INSERT INTO projects_users (project_id, user_id) VALUES($1, $2) RETURNING *',
      [req.body.project_id, req.body.user_id]
    );
    console.log(result.rows[0]);
    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in projects_users post" });
  }
});
app.delete("/delete_project_user_association/:project_id/:user_id",authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM projects_users WHERE project_id = $1 AND user_id = $2;", [
      req.params.project_id, req.params.user_id
    ]);
    if (result.rowCount === 0) {
      const message = `PROJECT_USER ASSOCIATION ${req.params.project_id}<=>${req.params.user_id} NOT FOUND`;
      console.log(message);
      res.status(404).send(message);
    } else {
      const message = `PROJECT_USER ASSOCIATION ${req.params.project_id}<=>${req.params.user_id} DELETED SUCCESSFULLY`;
      console.log(message);
      res.status(204).send(message);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error in PROJECT_USER ASSOCIATION delete");
  }
});

//LAYERS
app.get("/layers/:project_id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM layers WHERE project_id = $1",
      [req.params.project_id]
    );
    if (result.rowCount === 0) {
      const message = `NO LAYERS FOUND IN PROJECT${req.params.project_id}`;
      console.log(message);
      res.status(404).send(message);
    } else {
      const message = `LAYERS OF PROJECT${req.params.project_id} FOUND`;
      console.log(message);
      res.status(201).json(result.rows);
    }   
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in layers get" });
  }
});
app.post("/add_layer/:project_id",authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'INSERT INTO layers (name, project_id) VALUES($1, $2) RETURNING *',
      [req.body.name, req.params.project_id ]
    );
    console.log(result.rows[0]);
    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in layers post" });
  }
});
app.put("/update_layer/:id",authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "UPDATE layers SET name = $1, project_id = $2 WHERE id = $3 RETURNING *;",
      [req.body.name, req.body.project_id, req.params.id]
    );
    if (result.rowCount === 0) {
      const message = `NO LAYER FOUND IN ${req.params.project_id}`;
      console.log(message);
      res.status(404).send(message);
    } else {
      console.log(`LAYER UPDATE: ${console.log(result.rows[0])}`);
      res.status(200).json(result.rows[0]);
    }   
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in layer put" });
  }
});
app.delete("/delete_layer/:id",authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM layers WHERE id = $1;", [
      req.params.id
    ]);
    if (result.rowCount === 0) {
      const message = `LAYER ${req.params.id} NOT FOUND`;
      console.log(message);
      res.status(404).send();
    } else {
      const message = `LAYER ${req.params.id} DELETED SUCCESSFULLY`;
      console.log(message);
      res.status(204).send();
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error in LAYER delete");
  }
});

//POINTS
app.get("/project_points/:project_id", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *, 
             ST_AsGeoJSON(coordinates)::json->'coordinates' AS coordinates
      FROM 
        ((projects INNER JOIN layers ON projects.id = layers.project_id)
        INNER JOIN points ON layers.id = points.layer_id)
      WHERE projects.id = $1
    `, [req.params.project_id]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in points get" });
  }
});

app.get("/points/:layer_id", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *, 
             ST_AsGeoJSON(coordinates)::json->'coordinates' AS coordinates
      FROM points 
      WHERE layer_id = $1
    `, [req.params.layer_id]);

    

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in points get" });
  }
});
app.post("/add_point/:layer_id", async (req, res) => {
  try {
    
    const result = await pool.query(
      `INSERT INTO points (name, coordinates, foto, layer_id) 
       VALUES($1, ST_SetSRID(ST_MakePoint($2, $3), 4326), $4, $5) 
       RETURNING id, name, ARRAY[ST_X(coordinates), ST_Y(coordinates)] AS coordinates, foto, layer_id;`,
      [req.body.name, 
       req.body.lon, req.body.lat, 
       req.body.foto, 
       req.params.layer_id]
    );
    console.log("ADD POINT: ")
    console.log(result);
    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.put("/update_point/:id", async (req, res) => {
  try {
    console.log("POINT UPDATE: "); 
    console.log(req.body);
    const result = await pool.query(
        `UPDATE points SET 
            name = $1, 
            coordinates = ST_SetSRID(ST_MakePoint($2, $3), 4326), 
            foto = $4,
            layer_id = $5 
          WHERE id = $6
          RETURNING id, name, ARRAY[ST_X(coordinates), ST_Y(coordinates)] AS coordinates, foto, layer_id;`,
        [
            req.body.name, 
            req.body.coordinates[0], 
            req.body.coordinates[1],  
            req.body.foto,
            req.body.layer_id,  
            req.params.id
        ]
      );
    console.log(result.rows[0]);
    res.status(200).json(result.rows[0]);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error in point put" });
  }
});
app.delete("/delete_point/:id", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM points WHERE id = $1;", [
      req.params.id
    ]);
    if (result.rowCount === 0) {
      const message = `POINT ${req.params.id} NOT FOUND`;
      console.log(message);
      res.status(404).send();
    } else {
      const message = `POINT ${req.params.id} DELETED SUCCESSFULLY`;
      console.log(message);
      res.status(204).send();
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error in LAYER delete");
  }
});

//PROPERTIES
function convertArrayToStringFormat(array) {
  // Use JSON.stringify to convert the array to a JSON string
  const jsonString = JSON.stringify(array);
  
  // Replace the single quotes with escaped double quotes
  const formattedString = jsonString.replace(/"/g, '\\"');
  
  // Wrap the resulting string in double quotes
  return `"${formattedString}"`;
}
app.get("/project_properties/:project_id", async (req, res) => {
  try {
    
    const result = await pool.query(
        `SELECT * FROM properties WHERE project_id = $1;`, 
       [req.params.project_id]
    );
    console.log(result.rows)
    const properties = result.rows.map(row => ({
      ...row,
      values: JSON.parse(row.values)
    }));

    res.status(200).json(properties);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in properties get" });
  }
});
app.get("/properties/:point_id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT properties.id, properties.name, properties.values, properties.default_value, points_properties.point_id
       FROM properties 
       INNER JOIN points_properties
       ON properties.id = points_properties.property_id
       WHERE points_properties.point_id = $1;`, 
       [req.params.point_id]
    );
    
    const properties = result.rows.map(row => ({
      ...row,
      values: JSON.parse(row.values)
    }));

    res.status(200).json(properties);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in properties get" });
  }
});
app.post("/add_property", async (req, res) => {
  try {
    
    values_string = convertArrayToStringFormat(req.body.values);
    console.log(values_string)
    const result = await pool.query(
      `INSERT INTO properties (name, values, default_value, project_id)
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [req.body.name, values_string, req.body.default_value, req.body.project_id]
    );
    const newProperty = {
      ...result.rows[0],
      values: JSON.parse(result.rows[0].values)
    };
    console.log("ADDED PROPERTY: ", newProperty);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding property:", error);
    res.status(500).json({ error: "Internal server error post property" });
  }
});
app.put("/update_property/:id", async (req, res) => {
  try {
    console.log("PROPERTY UPDATE: ");
    const { id, name, values, default_value } = req.body;
    const values_string = convertArrayToStringFormat(values);
    console.log(values)
    console.log(values_string)
    const result = await pool.query(
      "UPDATE properties SET name = $1, values = $2, default_value = $3 WHERE id = $4 RETURNING *",
      [name, values_string, default_value, id]
    );
    const updatedProperty = result.rows[0];
    
    updatedProperty.values = JSON.parse(updatedProperty.values)
    
    console.log(updatedProperty);
    
    res.status(200).json(updatedProperty);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in property put" });
  }
});
app.delete("/delete_property/:id", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM properties WHERE id = $1;", [
      req.params.id
    ]);
    if (result.rowCount === 0) {
      const message = `PROPERTY ${req.params.id} NOT FOUND`;
      console.log(message);
      res.status(404).send();
    } else {
      const message = `PROPERTY ${req.params.id} DELETED SUCCESSFULLY`;
      console.log(message);
      res.status(204).send();
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error in PROPERTY delete");
  }
});

//POINTS_PROPERTIES
app.get("/points_properties_associations/:project_id", async (req, res) => {
  try {
    
    const result = await pool.query(`
      SELECT 
        points.id as point_id,
        properties.id, 
        properties.name,
        properties.values,
        properties.default_value,
        points_properties.value
      FROM 
        projects 
      INNER JOIN 
        layers ON projects.id = layers.project_id
      INNER JOIN 
        points ON points.layer_id = layers.id 
      INNER JOIN 
        points_properties ON points_properties.point_id = points.id 
      INNER JOIN 
        properties ON properties.id = points_properties.property_id
      WHERE 
        projects.id = $1;`, 
      [req.params.project_id]
    );
    console.log("PROPERTY_VALUES: ");
    console.log(result.rows);
    const properties = result.rows.map(row => ({
      ...row,
      values: JSON.parse(row.values)
    }));
    console.log(properties)
    res.status(200).json(properties);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in points_properties_associations get" });
  }
});
app.get("/point_properties_associations/:point_id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT properties.*, points_properties.value as point_property_value
       FROM properties
       INNER JOIN points_properties ON properties.id = points_properties.property_id
       WHERE points_properties.point_id = $1`,
      [req.params.point_id]
    );
    
    const properties = result.rows.map(row => ({
      ...row,
      values: JSON.parse(row.values)
    }));

    console.log(properties);
    res.status(200).json(properties);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in getting specific point properties" });
  }
});
app.get("/points_properties_associations/:project_id/:property_id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT properties.*, points_properties.value as point_property_value
       FROM properties 
       INNER JOIN points_properties ON properties.id = points_properties.property_id
       WHERE properties.id = $1 AND points_properties.project_id = $2;`,
      [req.params.property_id, req.params.project_id]
    );
    
    const properties = result.rows.map(row => ({
      ...row,
      values: JSON.parse(row.values)
    }));

    console.log(properties);
    res.status(200).json(properties);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in getting specific point properties" });
  }
});
app.post("/add_point_property_association/:point_id", async (req, res) => {
  try {
    
    const result = await pool.query(
      `INSERT INTO points_properties (point_id, property_id, value)
       VALUES ($1, $2, $3)
       RETURNING *;`,
      [req.params.point_id, 
       req.body.property_id,
       req.body.value]
    );
    console.log(result.rows);
    res.status(201).json(result.rows);
  }catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error post property" });
  }
});
app.put("/update_point_property_association/:point_id/:property_id", async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE points_properties 
       SET value = $1 
       WHERE point_id = $2 
       AND property_id = $3  
       RETURNING *`,
      [req.body.value , req.params.point_id, req.params.property_id ]
    );
    console.log("POINT_PROPERTY UPDATE: ");
    console.log(result.rows[0]);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in property put" });
  }
});
app.post("/add_project_property_association/:project_id", async (req, res) => {
  try {
      const result = await pool.query(
      `INSERT INTO points_properties (point_id, property_id, value)
        SELECT points.id, $1, $3
        FROM points
        INNER JOIN layers
        ON layers.id = points.layer_id
        INNER JOIN projects
        ON projects.id = layers.project_id
        WHERE projects.id = $2 
        RETURNING *;`,
      [req.body.property_id, 
       req.params.project_id,
       req.body.value]
    );
    console.log(result.rows);
    res.status(201).json(result.rows);
  }catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error post property" });
  }
});
app.put("/update_project_property_association/:project_id/:property_id", async (req, res) => {
  try {
    console.log("--POINT_PROPERTY UPDATE: --");
    const result = await pool.query(
      `UPDATE points_properties
      SET value = properties.default_value
      FROM properties, points
      WHERE points_properties.property_id = properties.id
      AND points_properties.point_id = points.id
      AND properties.project_id = $1
      AND points_properties.property_id = $2
      AND (points_properties.value = '' 
      OR points_properties.value = '""' 
      OR points_properties.value IS NULL)
      RETURNING *;`,
      [req.params.project_id, req.params.property_id ]
    );
    console.log(result.rows[0]);
    res.status(200).json({message:"query successfull"});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in property put" });
  }
});
app.delete("/delete_point_property_association/:project_id/:property_id", async (req, res) => {
  try {
    console.log("DELETE " + req.params.id);
    const result = await pool.query(`
      DELETE FROM points_properties 
      WHERE property_id = $1 
      AND point_id IN (
        SELECT pt.id 
        FROM points pt, layers l, projects pj
        WHERE pt.layer_id = l.id
        AND l.project_id = pj.id
        AND pj.id = $2
      );`, 
      [req.params.property_id, req.params.project_id]
    );
    if (result.rowCount === 0) {
      const message = `POINT_PROPERTY ASSOCIATION ${req.params.id} NOT FOUND`;
      console.log(message);
      res.status(404).send();
    } else {
      const message = `POINT_PROPERTY ASSOCIATION ${req.params.id} DELETED SUCCESSFULLY`;
      console.log(message);
      res.status(204).send();
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error in PROPERTY delete");
  }
});

//STYLES
app.get("/properties_styles/:project_id", async (req, res) => {
  try {
    const result = await pool.query(`
    SELECT DISTINCT
      p.id AS id, 
      s.id AS style_id, 
      p.name AS property_name, 
      p.values AS property_values, 
      ps.value AS condition, 
      s.icon, 
      s.size, 
      s.font
    FROM 
      points_properties pp
    INNER JOIN 
      properties_styles ps ON pp.property_id = ps.property_id
    INNER JOIN 
      properties p ON ps.property_id = p.id
    INNER JOIN 
      styles s ON ps.style_id = s.id
    WHERE p.project_id = $1;`, [req.params.project_id]);
    
    const property_styles = result.rows.map(row => ({
      ...row,
      property_values: JSON.parse(row.property_values)
    }));
    res.status(200).json(property_styles);
    console.log(property_styles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in properties_styles get" });
  }
});
app.get("/points_styles/:project_id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        points_properties.point_id, 
        points_properties.property_id, 
        points_properties.value,
        properties_styles.style_id,
        styles.icon,
        styles.size,
        styles.font
      FROM properties
	  INNER JOIN 
        points_properties
		ON properties.id = points_properties.property_id
      INNER JOIN 
        properties_styles
        ON properties_styles.property_id = points_properties.property_id AND points_properties.value = properties_styles.value
      INNER JOIN 
        styles
        ON styles.id = properties_styles.style_id
      INNER JOIN 
        points
        ON points.id = points_properties.point_id
     WHERE 
        properties.project_id = $1;`,
      [req.params.project_id]
    );
    console.log("POINT STYLES: ");
    console.log(result.rows);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in points_styles get" });
  }
});
app.post("/add_style", async (req, res) => {
  try {
    const result = await pool.query(
      "INSERT INTO styles (icon, size, font) VALUES ($1, $2, $3) RETURNING id, icon, size, font;",
      [req.body.icon, req.body.size, req.body.font]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in add_style post" });
  }
});
app.post("/add_property_style", async (req, res) => {
  try {
    const result = await pool.query(
      "INSERT INTO properties_styles (property_id, style_id, value) VALUES ($1, $2, $3) RETURNING property_id as id, style_id, value;",
      [req.body.property_id, req.body.style_id, req.body.value]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in add_property_style post" });
  }
});
app.put("/update_style/:style_id", async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE styles
       SET icon = $1, size = $2, font = $3
       WHERE id = $4
       RETURNING *;`,
      [req.body.icon, req.body.size, req.body.font, req.params.style_id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Style not found' });
    } else {
      console.log("STYLE UPDATE: ");
      console.log(result.rows[0]);
      res.status(200).json(result.rows[0]);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in update_style" });
  }
});
app.put("/update_properties_styles/:property_id/:style_id", async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE properties_styles
      SET property_id = $1,  value = $2
      WHERE style_id = $3
      RETURNING *;`,
      [ req.params.property_id, req.body.value, req.params.style_id, ]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Property-style not found' });
    } else {
      console.log("PROPERTY_STYLE UPDATE: ");
      console.log(result.rows[0]);
      res.status(200).json(result.rows[0]);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in update_properties_styles" });
  }
});
app.delete("/delete_style/:style_id", async (req, res) => {
  try {
    console.log("DELETE STYLE: ", req.params.style_id);
    const result = await pool.query("DELETE FROM styles WHERE id = $1;", [req.params.style_id]);
    if (result.rowCount === 0) {
      res.status(404).json({ error: "Style not found" });
    } else {
      res.status(204).send();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in delete_style" });
  }
});
app.delete("/delete_property_style/:property_id/:style_id", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM properties_styles WHERE property_id = $1 AND style_id = $2;", [
      req.params.property_id, req.params.style_id
    ]);
    if (result.rowCount === 0) {
      res.status(404).json({ error: "Property-style not found" });
    } else {
      res.status(204).send();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in delete_property_style" });
  }
});



