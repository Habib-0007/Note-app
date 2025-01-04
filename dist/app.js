"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const method_override_1 = __importDefault(require("method-override"));
const noteRoutes_1 = __importDefault(require("./routes/noteRoutes"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
// Middleware
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use((0, method_override_1.default)("_method"));
app.set("views", path_1.default.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
// Routes
app.use("/notes", noteRoutes_1.default);
// Default route
app.get("/", (req, res) => {
    res.redirect("/notes");
});
// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at
http://localhost:${PORT}`));
