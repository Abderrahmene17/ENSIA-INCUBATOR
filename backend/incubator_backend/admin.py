from django.contrib import admin
from .models import (
    User, Role, Startup, TeamMember, Application, ApplicationVote,
    ApplicationScore, Stage, Deliverable, DeliverableEvaluation, Resource,
    ResourceRequest, ResourceAllocation, Event, JuryEvaluation,
    FileMetadata, Notification
)

# Register all the models for the Django admin panel
admin.site.register(User)
admin.site.register(Role)
admin.site.register(Startup)
admin.site.register(TeamMember)
admin.site.register(Application)
admin.site.register(ApplicationVote)
admin.site.register(ApplicationScore)
admin.site.register(Stage)
admin.site.register(Deliverable)
admin.site.register(DeliverableEvaluation)
admin.site.register(Resource)
admin.site.register(ResourceRequest)
admin.site.register(ResourceAllocation)
admin.site.register(Event)
admin.site.register(JuryEvaluation)
admin.site.register(FileMetadata)
admin.site.register(Notification)
