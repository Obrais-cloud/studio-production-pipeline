from app.models.schemas import ProjectStatus


STUDIO_PALETTES = {
    "Cinefactory": "#e63946",
    "100 Sutton": "#457b9d",
    "Cinexin": "#f4a261",
}


def studio_color(studio: str) -> str:
    return STUDIO_PALETTES.get(studio, "#6c757d")


def status_label(status: ProjectStatus) -> str:
    labels = {
        ProjectStatus.IDEA: "Idea",
        ProjectStatus.SCRIPTING: "Guion",
        ProjectStatus.PRE_PRODUCTION: "Pre-producción",
        ProjectStatus.PRODUCTION: "Producción",
        ProjectStatus.POST_PRODUCTION: "Post-producción",
        ProjectStatus.REVIEW: "Revisión",
        ProjectStatus.PUBLISHED: "Publicado",
    }
    return labels.get(status, status.value)
