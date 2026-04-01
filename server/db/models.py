# db/models.py
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Junction table — no model class needed, just a plain Table
job_title_keywords = db.Table(
    "job_titles_to_keywords",
    db.Column("job_title_id", db.Integer, db.ForeignKey("job_titles.id", ondelete="CASCADE"), primary_key=True),
    db.Column("keyword_id", db.Integer, db.ForeignKey("keywords.id", ondelete="CASCADE"), primary_key=True),
)

class JobTitle(db.Model):
    __tablename__ = "job_titles"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)

    keywords = db.relationship("Keyword", secondary=job_title_keywords, backref=db.backref("job_titles", lazy=True))

class KeywordType(db.Model):
    __tablename__ = "keyword_types"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)

class Keyword(db.Model):
    __tablename__ = "keywords"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    keyword_type_id = db.Column(
        db.Integer,
        db.ForeignKey("keyword_types.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    keyword_type = db.relationship("KeywordType", backref=db.backref("keywords", lazy=True))
