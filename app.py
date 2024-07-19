from flask import Flask, session, redirect, url_for, flash, render_template, request
from flask_sqlalchemy import SQLAlchemy
import os
from datetime import datetime
from functools import wraps
import serverless_http

app = Flask(__name__)
app.config["SECRET_KEY"]  = 'divine123123000000'

app.config["UPLOAD_FOLDER"] = "static/uploads"

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
db = SQLAlchemy(app)

class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key = True)
    username = db.Column(db.String(50))
    email = db.Column(db.String(50), unique = True)
    password = db.Column(db.String(40))
    image_filename = db.Column(db.String(100))
    entries = db.relationship('Entry', backref='users', overlaps="users,entries")
    
class Entry(db.Model):
    __tablename__ = "entries"
    id = db.Column(db.Integer, primary_key = True)
    text = db.Column(db.String(300))
    image_post = db.Column(db.String(200))
    timestamp = db.Column(db.DateTime, default = datetime.utcnow)
    user_entry = db.relationship('User', backref='user_entries', overlaps="entries,users")
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'),  nullable = False)
    comment = db.relationship('Comment', backref = 'entries', lazy = True)
    like_count = db.Column(db.Integer, default = 0)


class Comment(db.Model):
	id = db.Column(db.Integer, primary_key = True)
	text = db.Column(db.String(100))
	timestamp = db.Column(db.DateTime, default = datetime.utcnow)
	entries_id = db.Column(db.Integer, db.ForeignKey('entries.id'), nullable = False)
	user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable = False)
	user_entries = db.relationship('User', backref = 'comments', lazy = True)
	entry_post = db.relationship('Entry', backref = 'comments', lazy = True)

class Note(db.Model):
    id = db.Column(db.Integer, primary_key= True)
    title = db.Column(db.String(100))
    text = db.Column(db.String(500))
    timestamp = db.Column(db.DateTime, default = datetime.utcnow)


class Msg(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    text = db.Column(db.String(200))
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable = False)
    users = db.relationship("User", backref = "msg", lazy = True)

def login_required(view):
    @wraps(view)
    def inner(*args, **kwargs):
        if not session.get("logged_in"):
            return redirect(url_for("login"))
        return view(*args, **kwargs)
    return inner


@app.route("/signup", methods = ["GET", "POST"])
def signup():
    if request.method == "POST":
        username = request.form["username"]
        email = request.form["email"]
        password = request.form["password"]
        image = request.files["image"]

        users = User.query.filter_by(email = email).first()
        if users:
            return "<h1>User email already exists</h1>"
        else:
            filename = image.filename
            image.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))
            new_user = User(
            username = username,
            email = email,
            password = password,
            image_filename = filename
            )
            db.session.add(new_user)
            db.session.commit()
            return redirect(url_for("login"))
    return render_template("signup.html")


@app.route("/login", methods = ["GET","POST"])
def login():
    if request.method == "POST":
        email = request.form["email"]
        password = request.form["password"]

        users = User.query.filter_by(email = email, password = password).first()
        """admin = User.query.filter_by(email = "admin@gmail.com", password = "123").first()"""
        if users:
            session["logged_in"] = True
            session["user_id"] = users.id
            return redirect(url_for("show_entries"))

        else:
            return "<h1>user not registered</h1>"
    return render_template("login.html")


@app.route("/logout")
def logout():
    session.pop("logged_in", None)
    return redirect(url_for("show_entries"))

@app.route("/")
@login_required
def show_entries():
    if "user_id" in session:
        user_id = session["user_id"]
        if user_id:
            user = User.query.get(user_id)
            if user:
                notes = Note.query.order_by(Note.id.desc()).all()
                return render_template("entries/home.html", name = user, notes = notes)


@app.route("/new_add")
@login_required
def show_newpage():
    return render_template("entries/add.html")



@app.route("/add_entry",  methods = ["GET", "POST"])
@login_required
def add_note():
    title = request.form["title"]
    text = request.form["text"]
    
    add = Note (
    title = title, 
    text = text
    )
    db.session.add(add)
    db.session.commit()
    flash("") 
    return redirect(url_for("show_entries")) 


@app.route("/delete/<int:note_id>")
@login_required
def delete_post(note_id):
    if "user_id" in session:

        note = Note.query.get(note_id)
        

        db.session.delete(note)
        db.session.commit()
        return redirect(url_for("show_entries"))

@app.route("/edit/<int:note_id>/new")
@login_required
def edit_go(note_id):
    note = Note.query.get(note_id)
    return render_template("entries/edit.html",  note = note) 



@app.route("/edit/<int:note_id>",  methods = ["GET",  "POST"])
@login_required
def edit(note_id):
    text = request.form["text"]
    title = request.form["title"]
    note = Note.query.get(note_id)
    if note:
        note.title = title
        note.text = text
        db.session.commit()
        return redirect(url_for("show_entries"))
    return render_template("entries/edit.html")



if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug = True, port=5001)


handler = serverless_http(app)
