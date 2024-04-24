const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");
const app = express();
const MAX_RETRIES = 10;
const RETRY_INTERVAL = 2000; // milliseconds

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
  host: 'localhost',//database se for pelo docker
  database: 'geo_data',
  password: 'olive3Dan@pg',
  port: '5432',
});

connectToDatabase();

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
app.post("/get_user", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE name = $1 AND password = $2;", 
      [req.body.name, req.body.password]
    );
    if (result.rowCount === 0) {
      console.log(`USER ${req.body.name} NOT FOUND`);
      res.status(404).send(`USER ${req.body.name} NOT FOUND`);
    } else {
      console.log(`USER ${req.body.name} SUCCESSFULLY FOUND`);
      res.status(200).json(result.rows[0]);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error in get_user");
  }
});
app.post("/add_user", async (req, res) => {
  try {
    const result = await pool.query(
      'INSERT INTO users (name, password, group_id) VALUES($1, $2, $3) RETURNING *',
      [req.body.name, req.body.password, req.body.group_id]
    );
    console.log(result.rows[0]);
    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in user post" });
  }
});
app.put("/update_user/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "UPDATE users SET name = $1, password = $2, group_id = $3 WHERE id = $4 RETURNING *;",
      [req.body.name, req.body.password, req.body.group_id, req.params.id]
    );
    console.log("USER UPDATE: ");
    console.log(result.rows[0]);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in user put" });
  }
});
app.delete("/delete_user/:id", async (req, res) => {
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
app.get("/projects/:user_id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM projects
       INNER JOIN projects_users ON projects.id = projects_users.project_id
       WHERE projects_users.user_id = $1`,
    [req.params.user_id]
    );
    if (result.rowCount === 0) {
      console.log(`USER ${req.params.user_id} NOT FOUND IN GET PROJECTS`);
      res.status(404).send(`USER ${req.params.user_id} NOT FOUND`);
    } else {
      res.status(200).json(result.rows);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in projects get" });
  }
});
app.post("/add_project", async (req, res) => {
  try {
    const result = await pool.query(
      'INSERT INTO projects (name) VALUES($1) RETURNING *',
      [req.body.name]
    );
    console.log(result.rows[0]);
    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in user post" });
  }
});
app.put("/update_project/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "UPDATE projects SET name = $1 WHERE id = $2 RETURNING *;",
      [req.body.name, req.params.id]
    );
    console.log("PROJECT UPDATE: ");
    console.log(result.rows[0]);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in project put" });
  }
});
app.delete("/delete_project/:id", async (req, res) => {
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
app.get("/projects_users_associations", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM projects_users");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in projects get" });
  }
});
app.post("/associate_project_user", async (req, res) => {
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
app.delete("/delete_project_user_association/:project_id/:user_id", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM projects_users WHERE project_id = $1 AND user_id = $2;", [
      req.params.project_id, req.params.user_id
    ]);
    if (result.rowCount === 0) {
      const message = `PROJECT_USER ASSOCIATION ${req.params.project_id}<=>${req.params.user_id} NOT FOUND`;
      console.log(message);
      res.status(404).send();
    } else {
      const message = `PROJECT_USER ASSOCIATION ${req.params.project_id}<=>${req.params.user_id} DELETED SUCCESSFULLY`;
      console.log(message);
      res.status(204).send();
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
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in layers get" });
  }
});
app.post("/add_layer/:project_id", async (req, res) => {
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
app.put("/update_layer/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "UPDATE layers SET name = $1, project_id = $2 WHERE id = $3 RETURNING *;",
      [req.body.name, req.body.project_id, req.params.id]
    );
    console.log("LAYER UPDATE: ");
    console.log(result.rows[0]);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in layer put" });
  }
});
app.delete("/delete_layer/:id", async (req, res) => {
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
      SELECT *, ST_AsGeoJSON(coordinates)::json->'coordinates' AS coordinates 
      FROM 
      ((projects INNER JOIN layers ON projects.id = layers.project_id)
      INNER JOIN points ON layers.id = points.layer_id)
      WHERE projects.id = $1`,
      [req.params.project_id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in points get" });
  }
});
app.get("/points/:layer_id", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *, ST_AsGeoJSON(coordinates)::json->'coordinates' AS coordinates 
      FROM points 
      WHERE layer_id = $1`,
      [req.params.layer_id]
    );
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
      [ req.body.name, 
        req.body.lon, req.body.lat, 
        req.body.foto, 
        req.params.layer_id ]
    );
    console.log(result.rows[0]);
    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.put("/update_point/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE points SET 
        name = $1, 
        coordinates = ST_SetSRID(ST_MakePoint($2, $3), 4326), 
        foto = $4,
        layer_id = $5 
       WHERE id = $6
       RETURNING *`,
      [req.body.name, 
       req.body.coordinates[0], req.body.coordinates[1],  
       req.body.foto, 
       req.body.layer_id,  
       req.params.id]
    );
    console.log("POINT UPDATE: ");
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
app.get("/project_properties/:project_id", async (req, res) => {
  try {
    const result = await pool.query(
        `SELECT * FROM properties where project_id = $1;`, 
        [req.params.project_id]
      );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in properties get" });
  }
});
app.get("/properties/:point_id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM properties 
       INNER JOIN points_properties
       ON properties.id = points_properties.property_id
       WHERE points_properties.point_id = $1;`, 
       [req.params.point_id]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in properties get" });
  }
});
app.post("/add_property/:project_id", async (req, res) => {
  try {
    const result = await pool.query(
      `INSERT INTO properties (name, values, default_value, project_id)
       VALUES($1, $2, $3, $4) 
       RETURNING *`,
      [req.body.name, 
        req.body.values,
        req.body.default_value,
        req.params.project_id
      ]
    );
    console.log(result.rows[0]);
    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error post property" });
  }
});
app.put("/update_property/:property_id", async (req, res) => {
  try {
    
    const jsonbValues = JSON.stringify(req.body.values);
    const result = await pool.query(
      "UPDATE properties SET name = $1, values = $2 WHERE id = $3 RETURNING *",
      [req.body.name, jsonbValues, req.params.property_id]
    );
    const updatedProperty = result.rows[0];
    updatedProperty.values = JSON.parse(updatedProperty.values);

    console.log("PROPERTY UPDATE: ");
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
app.get("/points_properties_associations", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM points_properties");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in points_properties_associations get" });
  }
});
app.get("/points_properties_associations/:point_id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM properties
       INNER JOIN points_properties ON properties.id = points_properties.property_id
       WHERE point_id = $1`,
    [req.params.point_id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in getting especific point properties" });
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
       INNER JOIN layers ON points.layer_id = layers.id
       INNER JOIN projects ON layers.project_id = projects.id
       WHERE projects.id = $2 
       RETURNING *;`,
      [req.body.property_id, 
       req.params.project_id,
       JSON.stringify(req.body.value)]
    );
    console.log(result.rows);
    res.status(201).json(result.rows);
  }catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error post property" });
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
app.get("/styles/:project_id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM styles WHERE project_id = $1;",[req.params.project_id]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in styles get" });
  }
});
app.get("/styles/:style_id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM styles WHERE id = $1;",
      [req.params.style_id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Style not found" });
    } else {
      res.status(200).json(result.rows[0]);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in style get" });
  }
});

app.post("/add_style", async (req, res) => {
  try {
    const result = await pool.query(
      "INSERT INTO styles (name, condition, value, priority, project_id) VALUES ($1, $2, $3, $4, $5) RETURNING *;",
      [req.body.name, req.body.condition, req.body.value, req.body.priority, req.body.project_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in style post" });
  }
});

app.put("/delete_style/:style_id", async (req, res) => {
  try {
    const result = await pool.query(
      "UPDATE styles SET name = $1, condition = $2, value = $3, priority = $4 WHERE id = $5 RETURNING *;",
      [
        req.body.name,
        req.body.condition,
        req.body.value,
        req.body.priority,
        req.params.style_id,
      ]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Style not found" });
    } else {
      res.status(200).json(result.rows[0]);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in style put" });
  }
});

app.delete("/styles/:style_id", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM styles WHERE id = $1;", [
      req.params.style_id
    ]);
    if (result.rowCount === 0) {
      res.status(404).json({ error: "Style not found" });
    } else {
      res.status(204).send();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error in style delete" });
  }
});

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
