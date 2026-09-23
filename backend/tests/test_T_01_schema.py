from sqlalchemy import create_engine, inspect

from app.db.models import Base


def test_T_01_schema_and_migration_create_required_tables():
    engine = create_engine("sqlite:///:memory:")

    # migrate schema into the in-memory database
    Base.metadata.create_all(bind=engine)

    inspector = inspect(engine)
    tables = inspector.get_table_names()

    assert "slots" in tables
    assert "bookings" in tables
    assert "audit_logs" in tables

    columns = {table: {col["name"] for col in inspector.get_columns(table)} for table in tables}
    assert {"id", "slot_date", "start_time", "package_code", "capacity", "remaining"}.issubset(columns["slots"])
    assert {"id", "hn", "slot_id", "booking_date", "queue_no", "status", "created_at"}.issubset(columns["bookings"])
    assert {"id", "actor_id", "action", "hn", "accessed_at"}.issubset(columns["audit_logs"])
