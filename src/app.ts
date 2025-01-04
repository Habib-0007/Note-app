import express from "express";
import bodyParser from "body-parser";
import methodOverride from "method-override";
import noteRoutes from "./routes/noteRoutes";
import path from "path";

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/notes", noteRoutes);

// Default route
app.get("/", (req, res) => {
	res.redirect("/notes");
});

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at
http://localhost:${PORT}`));