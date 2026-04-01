from db.models import db, JobTitle, Keyword, KeywordType
import re

def save_keywords(title: str, keywords: list[dict]):
    # get or create the job title
    job_title = JobTitle.query.filter_by(name=title).first()
    if not job_title:
        job_title = JobTitle(name=title)
        db.session.add(job_title)

    for kw in keywords:
        # get or create the keyword type
        keyword_type = KeywordType.query.filter_by(name=kw["type"]).first()
        if not keyword_type:
            keyword_type = KeywordType(name=kw["type"])
            db.session.add(keyword_type)
            db.session.flush()  # flush so keyword_type.id is available

        # get or create the keyword itself
        keyword = Keyword.query.filter_by(name=kw["text"], keyword_type_id=keyword_type.id).first()
        if not keyword:
            keyword = Keyword(name=kw["text"], keyword_type=keyword_type)
            db.session.add(keyword)

        # link to job title via junction table if not already linked
        if keyword not in job_title.keywords:
            job_title.keywords.append(keyword)

    db.session.commit()

def get_cached_keywords(job_title_id: str) -> list[dict] | None:
    job_title_row = JobTitle.query.filter_by(id=job_title_id).first()

    if not job_title_row or not job_title_row.keywords:
        return None

    return [
        {"text": kw.name, "type": kw.keyword_type.name}
        for kw in job_title_row.keywords
    ]