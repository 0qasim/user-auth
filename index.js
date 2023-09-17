// external imports
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const path = require("path");

//internal imports
const EmployeeModel = require("./models/Employee.js");

const app = express();

app.use(express.json()); // Use JSON body parsing middleware
app.use(cookieParser());

app.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Origin",
    "https://tiny-plum-pangolin-veil.cyclic.cloud"
  ); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept"
  );
  next();
});

app.use(
  cors({
    origin: ["http://localhost:3002"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Access-Control-Allow-Origin",
      "X-Requested-With",
      "Accept",
    ],
  })
);

const uri = `mongodb://qaziqasim:qasim92@ac-q6ddqhi-shard-00-00.sp0ggxq.mongodb.net:27017,ac-q6ddqhi-shard-00-01.sp0ggxq.mongodb.net:27017,ac-q6ddqhi-shard-00-02.sp0ggxq.mongodb.net:27017/?ssl=true&replicaSet=atlas-9hh664-shard-0&authSource=admin&retryWrites=true&w=majority`;

mongoose
  .connect(uri)
  .then(() => {
    console.log("connected");
  })
  .catch((err) => {
    console.error(err);
  });

app.use(express.static(path.join(__dirname, "./client/build")));
app.get("*", function (_, res) {
  res.sendFile(
    path.join(__dirname, "./client/build/index.html"),
    function (err) {
      res.status(500).send(err);
    }
  );
});

const verifyUser = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.json("There token is Missing");
  }

  jwt.verify(token, "jwt-secret-key", (err, decoded) => {
    if (err) {
      return res.json("There token is wrong");
    } else {
      req.email = decoded.email;
      req.name = decoded.name;
      next();
    }
  });
};

app.get("/verify", verifyUser, (req, res) => {
  return res.json({ email: req.email, name: req.name });
});

app.post("/SignIn", async (req, res) => {
  try {
    const { email, password } = req.body;

    const employee = await EmployeeModel.findOne({ email: email });

    if (!employee) {
      return res
        .status(404)
        .send("Employee with this email not found. Please sign up first");
    }

    const isPasswordCorrect = await bcrypt.compare(password, employee.password);

    if (!isPasswordCorrect) {
      return res.status(400).send("Password incorrect.");
    }

    const token = jwt.sign({ email, name: employee.name }, "jwt-secret-key", {
      expiresIn: "1d",
    });

    res.cookie("token", token);

    res.status(200).send("Employee signed In");
  } catch (err) {
    console.error(err);
    res.status(400).send({ message: err.message });
  }
});

app.post("/Signup", async (req, res) => {
  const { name, email, password } = req.body;

  const alreadyPresent = await EmployeeModel.findOne({ email: email });

  if (alreadyPresent) {
    return res.status(400).send("Employee with this email already exists.");
  }

  const hashedpassword = await bcrypt.hash(password, 10);

  const addedEmployee = await EmployeeModel.create({
    name,
    email,
    password: hashedpassword,
  });

  res.status(201).send(`Employee created: ${addedEmployee}`);
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.send("**Success");
});

app.get("/ok", async (req, res) => {
  try {
    const employees = await EmployeeModel.find();

    res.status(200).send(employees);
  } catch (err) {
    console.error(err);
  }
});

app.listen(3002, () => {
  console.log("Server is running on http://localhost:3002");
});
