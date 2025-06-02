from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView, TokenRefreshView,
)
from .views import MyTokenObtainPairView

from . import views 
from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework.permissions import AllowAny


schema_view = get_schema_view(
    openapi.Info(title="API Docs.",
                 default_version = "v1",
                 description="lorem Ipsum is simply a dummy text"),
                 public=True,
                 permission_classes=(permissions.AllowAny,),
)


urlpatterns = [
    # Root URL - redirect to Swagger documentation
    path('', RedirectView.as_view(url='/swagger/', permanent=False)),
    path('admin/', admin.site.urls),
    path('accounts/', include('allauth.urls')),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    # Authentication
    path('auth/register/', views.users_list, name='register'),
    path('auth/login/', MyTokenObtainPairView.as_view(), name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/signup/', views.public_register, name='public-register'),
    

    # Users & Roles
    path('users/', views.users_list, name='users-list'),
    path('users/<int:id>/', views.user_detail, name='user-detail'),
    path('roles/', views.roles_list, name='roles-list'),

    # Startups & Team Management
    path('startups/', views.startups_list, name='startups-list'),
    path('startups/<int:id>/', views.startup_detail, name='startup-detail'),
    path('startups/<int:startup_id>/team/', views.team_members_list, name='team-members'),
    path('startups/<int:startup_id>/team/<int:member_id>/', views.remove_team_member, name='remove-team-member'),
    path('startups/<int:startup_id>/team/<int:member_id>/', views.team_member_detail, name='team-member-detail'),

    # Applications
    path('applications/', views.applications_list, name='applications-list'),
    path('applications/<int:id>/', views.application_detail, name='application-detail'),
    path('applications/<int:id>/status/', views.application_status_update, name='application-status'),
    path('applications/<int:id>/average-score/', views.application_average_score, name='application-average-score'),
    path('applications/<int:id>/votes/', views.application_votes, name='application-votes'),
    path('applications/<int:id>/scores/', views.application_scores, name='application-scores'),

    # Deliverables & Stages
    path('stages/', views.stages_list, name='stages-list'),
    path('stages/<int:id>/', views.stage_detail, name='stage-detail'),
    path('deliverables/', views.deliverables_list, name='deliverables-list'),
    path('deliverables/<int:id>/', views.deliverable_detail, name='deliverable-detail'),
    path('deliverables/<int:id>/evaluate/', views.evaluate_deliverable, name='evaluate-deliverable'),
    path('deliverables/<int:id>/evaluations/', views.deliverable_evaluations, name='deliverable-evaluations'),

    # Resources
    path('resources/', views.resources_list, name='resources-list'),
    path('resources/<int:id>/', views.resource_detail, name='resource-detail'),
    path('resource-requests/', views.resource_requests_list, name='resource-requests'),
    path('resource-allocations/', views.resource_allocations_list, name='resource-allocations'),

    # Events
    path('events/', views.events_list, name='events-list'),
    path('events/<int:id>/', views.event_detail, name='event-detail'),

    # Jury Evaluations
    path('jury-evaluations/', views.jury_evaluations_list, name='jury-evaluations'),
    path('jury-evaluations/<int:id>/', views.jury_evaluation_detail, name='jury-evaluation-detail'),

    # Files
    path('files/upload/', views.upload_file, name='upload-file'),
    path('files/', views.list_files, name='files-list'),
    path('files/<int:id>/', views.file_detail, name='file-detail'),

    # Notifications
    path('notifications/', views.notifications_list, name='notifications-list'),
    path('notifications/<int:id>/read/', views.mark_notification_read, name='mark-notification-read'),
    path('notifications/<int:id>/', views.delete_notification, name='delete-notification'),

    #incubation form 
    path('incubation-form/', views.incubation_forms_list, name='incubation-forms-list'),
    path('incubation-form/<int:id>/', views.incubation_form_detail, name='incubation-form-detail'),
    path('incubation-form/<int:id>/status/', views.incubation_form_status_update, name='incubation-form-status-update'),
    path('incubation-form/pending/', views.pending_incubation_forms, name='pending-incubation-forms'),
    path('incubation-form/my-submissions/', views.my_incubation_submissions, name='my-incubation-submissions'),
    path('incubation-form/<int:id>/scores/',views.incubation_form_scores,name='incubation_form_scores'),
    # Mentors and Trainers
    path('mentors/', views.mentors_list, name='mentors-list'),
    path('mentors/create/', views.create_mentor, name='create-mentor'),
    path('mentors/<int:id>/', views.mentor_detail, name='mentor-detail'),
    path('trainers/', views.trainers_list, name='trainers-list'),
    path('trainers/create/', views.create_trainer, name='create-trainer'),
    path('trainers/<int:id>/', views.trainer_detail, name='trainer-detail'),

    # Analytics
    path('analytics/dashboard/', views.dashboard_stats, name='dashboard-stats'),
    path('analytics/application-status/', views.application_status_analytics, name='application-status-analytics'),
    path('analytics/startup-status/', views.startup_status_analytics, name='startup-status-analytics'),
    path('analytics/resource-utilization/', views.resource_utilization_analytics, name='resource-utilization-analytics'),
    path('analytics/survival-rate/', views.survival_rate_analytics, name='survival-rate-analytics'),
    path('analytics/acceptance-rate/', views.acceptance_rate_analytics, name='acceptance-rate-analytics'),
    
  

]
