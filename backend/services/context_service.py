"""
Context Service
Handles storage and retrieval of dataset context insights
"""

import json
from typing import Optional, Dict, Any
from datetime import datetime
from db.client import get_db

class ContextService:
    """Service for managing context insights"""
    
    @staticmethod
    async def save_context_insight(
        session_id: str,
        context_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Save context insight for a dataset
        
        Args:
            session_id: Session ID
            context_data: Context analysis from Context Agent
            
        Returns:
            Saved context insight record
        """
        try:
            db = get_db()
            
            # Prepare the data
            insight = {
                "session_id": session_id,
                "dataset_name": context_data.get("dataset_name", "Unknown Dataset"),
                "purpose": context_data.get("purpose", ""),
                "domain": context_data.get("domain", ""),
                "key_entities": context_data.get("key_entities", []),
                "use_cases": context_data.get("use_cases", []),
                "audience": context_data.get("audience", ""),
                "business_value": context_data.get("business_value", ""),
                "data_health": context_data.get("data_health", ""),
                "key_insights": context_data.get("key_insights", []),
                "recommended_analyses": context_data.get("recommended_analyses", []),
                "context_summary": context_data.get("context_summary", ""),
            }
            
            # Insert into database
            result = db.execute(
                """
                INSERT INTO context_insights (
                    session_id, dataset_name, purpose, domain, key_entities,
                    use_cases, audience, business_value, data_health,
                    key_insights, recommended_analyses, context_summary
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                RETURNING *
                """,
                (
                    insight["session_id"],
                    insight["dataset_name"],
                    insight["purpose"],
                    insight["domain"],
                    json.dumps(insight["key_entities"]),
                    json.dumps(insight["use_cases"]),
                    insight["audience"],
                    insight["business_value"],
                    insight["data_health"],
                    json.dumps(insight["key_insights"]),
                    json.dumps(insight["recommended_analyses"]),
                    insight["context_summary"],
                )
            ).fetchone()
            
            return {
                "success": True,
                "data": dict(result) if result else insight
            }
            
        except Exception as e:
            print(f"❌ [ContextService] Error saving context insight: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    @staticmethod
    async def get_context_insight(session_id: str) -> Dict[str, Any]:
        """
        Get context insight for a session
        
        Args:
            session_id: Session ID
            
        Returns:
            Context insight record or None
        """
        try:
            db = get_db()
            
            result = db.execute(
                """
                SELECT * FROM context_insights
                WHERE session_id = ?
                ORDER BY created_at DESC
                LIMIT 1
                """,
                (session_id,)
            ).fetchone()
            
            if result:
                record = dict(result)
                # Parse JSON arrays
                record["key_entities"] = json.loads(record.get("key_entities", "[]"))
                record["use_cases"] = json.loads(record.get("use_cases", "[]"))
                record["key_insights"] = json.loads(record.get("key_insights", "[]"))
                record["recommended_analyses"] = json.loads(record.get("recommended_analyses", "[]"))
                return {
                    "success": True,
                    "data": record
                }
            
            return {
                "success": False,
                "error": "No context insight found for this session"
            }
            
        except Exception as e:
            print(f"❌ [ContextService] Error retrieving context insight: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    @staticmethod
    async def update_context_insight(
        session_id: str,
        context_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Update context insight for a session
        
        Args:
            session_id: Session ID
            context_data: Updated context analysis
            
        Returns:
            Updated context insight record
        """
        try:
            db = get_db()
            
            result = db.execute(
                """
                UPDATE context_insights
                SET 
                    dataset_name = ?,
                    purpose = ?,
                    domain = ?,
                    key_entities = ?,
                    use_cases = ?,
                    audience = ?,
                    business_value = ?,
                    data_health = ?,
                    key_insights = ?,
                    recommended_analyses = ?,
                    context_summary = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE session_id = ?
                RETURNING *
                """,
                (
                    context_data.get("dataset_name", "Unknown Dataset"),
                    context_data.get("purpose", ""),
                    context_data.get("domain", ""),
                    json.dumps(context_data.get("key_entities", [])),
                    json.dumps(context_data.get("use_cases", [])),
                    context_data.get("audience", ""),
                    context_data.get("business_value", ""),
                    context_data.get("data_health", ""),
                    json.dumps(context_data.get("key_insights", [])),
                    json.dumps(context_data.get("recommended_analyses", [])),
                    context_data.get("context_summary", ""),
                    session_id,
                )
            ).fetchone()
            
            return {
                "success": True,
                "data": dict(result) if result else context_data
            }
            
        except Exception as e:
            print(f"❌ [ContextService] Error updating context insight: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    @staticmethod
    async def delete_context_insight(session_id: str) -> Dict[str, Any]:
        """
        Delete context insight for a session
        
        Args:
            session_id: Session ID
            
        Returns:
            Success status
        """
        try:
            db = get_db()
            
            db.execute(
                "DELETE FROM context_insights WHERE session_id = ?",
                (session_id,)
            )
            
            return {
                "success": True,
                "message": "Context insight deleted"
            }
            
        except Exception as e:
            print(f"❌ [ContextService] Error deleting context insight: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
