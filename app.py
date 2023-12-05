from boggle import Boggle
from flask import Flask, session, request, render_template, redirect, jsonify

boggle_game = Boggle()

# from flask_debugtoolbar import DebugToolbarExtension

app = Flask(__name__)
app.debug = True
app.config["SECRET_KEY"] = "lollllzzzzz"

# toolbar = DebugToolbarExtension(app)


@app.route("/")
def index():
    """Display the game board"""
    session["count"] = session.get("count", 0)
    session["board"] = boggle_game.make_board()
    return render_template("index.jinja-html", board=session["board"])


@app.route("/restart")
def restart():
    """Display the game board"""
    session["count"] = session.get("count") + 1
    session["board"] = boggle_game.make_board()
    return jsonify(board=session["board"])


@app.route("/guess")
def guess():
    """Register the guess and respond with result"""
    word = request.args.get("word")
    result = {"result": boggle_game.check_valid_word(session["board"], word)}
    json = jsonify(result)
    return json


@app.route("/game-over", methods=["POST"])
def game_over():
    """Record the high score and play count"""
    json = request.json
    session["high-score"] = json["highScore"]
    session["count"] = json["count"]
    return json, 200
