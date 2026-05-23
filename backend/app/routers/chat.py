from fastapi import APIRouter
from app.models.schemas import ChatRequest, ChatResponse

router = APIRouter(prefix="/chat", tags=["chat"])

KEYWORDS = {
    "guion": "Para el guion, te recomiendo usar el template de tres actos. ¿Quieres que genere un esquema?",
    "rodaje": "El rodaje está planificado para los días 10-12 de julio. ¿Necesitas el call sheet?",
    "edición": "La edición está al 65%. Luis está trabajando en la corrección de color.",
    "presupuesto": "El presupuesto total del proyecto es de 15.000€. Llevamos gastados 9.200€.",
    "deadline": "La fecha límite del cortometraje es el 15 de julio. Quedan 55 días.",
    "assets": "Tenemos 106 assets en total: 24 en Cinefactory, 67 en 100 Sutton, 15 en Cinexin.",
    "publicar": "Para publicar necesitamos: poster, trailer, y calendario de redes sociales.",
}


@router.post("", response_model=ChatResponse)
def chat(payload: ChatRequest) -> ChatResponse:
    msg = payload.message.lower()
    for kw, reply in KEYWORDS.items():
        if kw in msg:
            return ChatResponse(
                reply=reply,
                suggested_actions=["Ver pipeline", "Ver presupuesto", "Ver assets"],
            )
    return ChatResponse(
        reply=f"Hola, soy el asistente de producción. Pregúntame sobre guiones, rodaje, edición, presupuesto, deadlines o assets. Tu mensaje: '{payload.message}'",
        suggested_actions=["Ver proyectos activos", "Ver timeline"],
    )
