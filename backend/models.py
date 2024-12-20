from datetime import datetime, timezone
import uuid
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def generate_uuid():
    return str(uuid.uuid4())

class Question(db.Model):
    id = db.Column(db.String, primary_key=True, default=generate_uuid)
    text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

class Prompt(db.Model):
    id = db.Column(db.String, primary_key=True, default=generate_uuid)
    question_id = db.Column(db.String, db.ForeignKey('question.id'), nullable=False)
    text = db.Column(db.Text, nullable=False)
    score = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    question = db.relationship('Question', backref=db.backref('prompts', lazy=True))

class Matchup(db.Model):
    id = db.Column(db.String, primary_key=True, default=generate_uuid)
    question_id = db.Column(db.String, db.ForeignKey('question.id'), nullable=False)
    prompt1_id = db.Column(db.String, db.ForeignKey('prompt.id'), nullable=False)
    output1 = db.Column(db.Text, nullable=False)
    prompt2_id = db.Column(db.String, db.ForeignKey('prompt.id'), nullable=False)
    output2 = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    prompt1 = db.relationship('Prompt', foreign_keys=[prompt1_id])
    prompt2 = db.relationship('Prompt', foreign_keys=[prompt2_id])
    question = db.relationship('Question', backref=db.backref('matchups', lazy=True))

class Vote(db.Model):
    id = db.Column(db.String, primary_key=True, default=generate_uuid)
    matchup_id = db.Column(db.String, db.ForeignKey('matchup.id'), nullable=False)
    winner_prompt_id = db.Column(db.String, db.ForeignKey('prompt.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    matchup = db.relationship('Matchup', backref=db.backref('votes', lazy=True))
    winner_prompt = db.relationship('Prompt')
