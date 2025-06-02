from rest_framework.decorators import (
    api_view, authentication_classes, permission_classes, throttle_classes
)
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, BasePermission, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.pagination import PageNumberPagination
from rest_framework.throttling import UserRateThrottle
from django.db.models import Avg
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
import logging

# Import models
from .models import (
    User, Role, Startup, TeamMember, Application, ApplicationVote,
    ApplicationScore, Stage, Deliverable, DeliverableEvaluation, Resource,
    ResourceRequest, ResourceAllocation, Event, JuryEvaluation,
    FileMetadata, Notification , IncubationForm
)

# Import serializers
from .serializers import (
    UserSerializer, RoleSerializer, StartupSerializer, TeamMemberSerializer,
    ApplicationSerializer, ApplicationVoteSerializer, ApplicationScoreSerializer,
    StageSerializer, DeliverableSerializer, DeliverableEvaluationSerializer,
    ResourceSerializer, ResourceRequestSerializer, ResourceAllocationSerializer,
    EventSerializer, JuryEvaluationSerializer, FileMetadataSerializer, NotificationSerializer,MyTokenObtainPairSerializer,IncubationForm,IncubationFormDetailSerializer,IncubationFormListSerializer,IncubationFormSerializer,SignupUserSerializer
)
from rest_framework_simplejwt.views import TokenObtainPairView

# Import utility functions for permission checks and error responses
from .utils import is_admin, is_student, is_owner, error_response

# -------------------------------
# Custom Throttles
# -------------------------------
class BurstRateThrottle(UserRateThrottle):
    scope = 'burst'
    rate = '10/min'  # 10 requests per minute

# -------------------------------
# Pagination
# -------------------------------
class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'

# -------------------------------
# USERS & ROLES
# -------------------------------
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        try:
            return super().post(request, *args, **kwargs)
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Login error: {str(e)}, Request data: {request.data}")
            raise
'''
@api_view(['POST'])
@permission_classes([])
def public_register(request):
    try:
        data = request.data
        serializer = UserSerializer(data=data)
        if serializer.is_valid():
            try:
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as save_error:
                return Response({'error': str(save_error)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.exception("Error in public_register")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
'''
@api_view(['POST'])
@permission_classes([])
def public_register(request):
    """
    Public view for user registration.
    Automatically assigns the student role.
    """
    try:
        data = request.data
        serializer = SignupUserSerializer(data=data)
        if serializer.is_valid():
            try:
                user = serializer.save()
                return Response(
                    {
                        'success': True,
                        'message': 'User registered successfully',
                        'user': {
                            'id': user.id,
                            'full_name': user.full_name,
                            'email': user.email,
                            'role': user.role.name if user.role else None
                        }
                    }, 
                    status=status.HTTP_201_CREATED
                )
            except Exception as save_error:
                return Response(
                    {'error': str(save_error)},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.exception("Error in public_signup")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'POST'])
def users_list(request):
    if request.method == 'GET':
        # Allow filtering by name
        name = request.query_params.get('full_name', '')
        users = User.objects.all()
        if name:
            users = users.filter(full_name__icontains=name)
        
        paginator = StandardPagination()
        page = paginator.paginate_queryset(users, request)
        serializer = UserSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
    elif request.method == 'POST':
        if not is_admin(request.user):
            return error_response('Admin required', 'admin_required', status.HTTP_403_FORBIDDEN)
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()  # Handles user creation and password hashing.
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def user_detail(request, id):
    try:
        user_obj = User.objects.get(id=id)
    except User.DoesNotExist:
        return error_response('User not found', 'user_not_found', status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = UserSerializer(user_obj)
        return Response(serializer.data)
    elif request.method == 'PUT':
        if request.user != user_obj and not is_admin(request.user):
            return error_response('Permission denied', 'permission_denied', status.HTTP_403_FORBIDDEN)
        serializer = UserSerializer(user_obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        if not is_admin(request.user):
            return error_response('Admin required', 'admin_required', status.HTTP_403_FORBIDDEN)
        user_obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
# @authentication_classes([JWTAuthentication])
# @permission_classes([IsAuthenticated])
def roles_list(request):
    roles = Role.objects.all()
    serializer = RoleSerializer(roles, many=True)
    return Response(serializer.data)

# -------------------------------
# STARTUPS & TEAM MANAGEMENT
# -------------------------------
@api_view(['GET', 'PUT', 'DELETE'])
@authentication_classes([])
@permission_classes([AllowAny])
def team_member_detail(request, startup_id, member_id):
    """
    Get, update or delete a specific team member
    """
    try:
        # Check if startup exists
        try:
            startup = Startup.objects.get(id=startup_id)
        except Startup.DoesNotExist:
            return Response(
                {'error': 'Startup not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if team member exists
        try:
            team_member = TeamMember.objects.get(id=member_id, startup=startup)
        except TeamMember.DoesNotExist:
            return Response(
                {'error': 'Team member not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        if request.method == 'GET':
            serializer = TeamMemberSerializer(team_member)
            return Response(serializer.data)
        
        elif request.method == 'PUT':
            data = request.data.copy()
            
            # Ensure startup ID remains the same
            data['startup'] = startup_id
            
            # Handle team_leader_name if provided
            if 'team_leader_name' in data:
                try:
                    users = User.objects.filter(full_name=data['team_leader_name'])
                    if users.exists():
                        data['user'] = users.first().id
                    else:
                        return Response(
                            {'error': f"User with name {data['team_leader_name']} not found"}, 
                            status=status.HTTP_404_NOT_FOUND
                        )
                except Exception as e:
                    return Response(
                        {'error': f"Error finding user: {str(e)}"}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Handle member_name if provided
            if 'member_name' in data:
                try:
                    users = User.objects.filter(full_name=data['member_name'])
                    if users.exists():
                        data['user'] = users.first().id
                    else:
                        return Response(
                            {'error': f"User with name {data['member_name']} not found"}, 
                            status=status.HTTP_404_NOT_FOUND
                        )
                except Exception as e:
                    return Response(
                        {'error': f"Error finding user: {str(e)}"}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            serializer = TeamMemberSerializer(team_member, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        elif request.method == 'DELETE':
            team_member.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
    
    except Exception as e:
        # Log the error for debugging
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error in team_member_detail: {str(e)}")
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
@api_view(['GET', 'POST'])
# TEMPORARY: Comment out authentication for development
# @authentication_classes([JWTAuthentication])
# @permission_classes([IsAuthenticated])
def startups_list(request):
    if request.method == 'GET':
        startups = Startup.objects.all()
        serializer = StartupSerializer(startups, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        # TEMPORARY: Skip user check for development
        # if not is_student(request.user):
        #     return error_response('Students only', 'students_only', status.HTTP_403_FORBIDDEN)
        serializer = StartupSerializer(data=request.data)
        if serializer.is_valid():
            # TEMPORARY: Use a default user ID for development
            serializer.save()  # Assuming user ID 1 exists
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
# TEMPORARY: Comment out authentication for development
# @authentication_classes([JWTAuthentication])
# @permission_classes([IsAuthenticated])
def startup_detail(request, id):
    try:
        startup = Startup.objects.get(id=id)
    except Startup.DoesNotExist:
        return error_response('Startup not found', 'startup_not_found', status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        serializer = StartupSerializer(startup)
        return Response(serializer.data)
    elif request.method == 'PUT':
        # TEMPORARY: Skip user check for development
        # if request.user != startup.user and not is_admin(request.user):
        #     return error_response('Permission denied', 'permission_denied', status.HTTP_403_FORBIDDEN)
        serializer = StartupSerializer(startup, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        # TEMPORARY: Skip user check for development
        # if request.user != startup.user and not is_admin(request.user):
        #     return error_response('Permission denied', 'permission_denied', status.HTTP_403_FORBIDDEN)
        try:
            # Delete all team members first to handle integrity constraints
            TeamMember.objects.filter(startup=startup).delete()
            
            # Now delete the startup
            startup.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error deleting startup {startup.id}: {str(e)}")
            return Response(
                {"error": f"Failed to delete startup: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

@api_view(['GET', 'POST'])
#@authentication_classes([JWTAuthentication])
#@permission_classes([IsAuthenticated])
def team_members_list(request, startup_id):
    try:
        startup = Startup.objects.get(id=startup_id)
    except Startup.DoesNotExist:
        return error_response('Startup not found', 'startup_not_found', status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        members = TeamMember.objects.filter(startup=startup)
        serializer = TeamMemberSerializer(members, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        data = request.data.copy()
        data['startup'] = startup.id
        
        # Handle member_name if present
        if 'member_name' in data and not 'user' in data:
            try:
                # Find the user by full_name
                user = User.objects.get(full_name=data['member_name'])
                data['user'] = user.id
                # Remove member_name as it's not a field in TeamMember model
                data.pop('member_name')
            except User.DoesNotExist:
                return error_response(f"User with name '{data['member_name']}' not found", 'user_not_found', status.HTTP_400_BAD_REQUEST)
            except User.MultipleObjectsReturned:
                return error_response(f"Multiple users with name '{data['member_name']}' found", 'multiple_users_found', status.HTTP_400_BAD_REQUEST)
        
        # Handle team_leader_name if present
        if 'team_leader_name' in data and not 'user' in data:
            try:
                # Find the user by full_name
                user = User.objects.get(full_name=data['team_leader_name'])
                data['user'] = user.id
                # Remove team_leader_name as it's not a field in TeamMember model
                data.pop('team_leader_name')
            except User.DoesNotExist:
                return error_response(f"User with name '{data['team_leader_name']}' not found", 'user_not_found', status.HTTP_400_BAD_REQUEST)
            except User.MultipleObjectsReturned:
                return error_response(f"Multiple users with name '{data['team_leader_name']}' found", 'multiple_users_found', status.HTTP_400_BAD_REQUEST)
        
        # Validate that we have a user ID
        if 'user' not in data:
            return error_response("User ID is required", 'user_required', status.HTTP_400_BAD_REQUEST)
            
        # Validate that the user exists
        try:
            user = User.objects.get(id=data['user'])
        except User.DoesNotExist:
            return error_response(f"User with ID {data['user']} not found", 'user_not_found', status.HTTP_400_BAD_REQUEST)
        
        # Validate that the user is a student
        if hasattr(user, 'role') and user.role and user.role.name != 'student':
            return error_response(
                f"Team members must be students, but {user.full_name} has role {user.role.name}", 
                'not_student', 
                status.HTTP_400_BAD_REQUEST
            )
        
        # Check if this is a team leader
        is_team_leader = data.get('role_in_team') == 'Team Leader'
        
        # Validate that the user is not already a team leader for another startup
        if is_team_leader:
            existing_leader = TeamMember.objects.filter(user=user, role_in_team='Team Leader')
            if existing_leader.exists():
                return error_response(
                    f"{user.full_name} is already a team leader for another startup", 
                    'already_team_leader',
                    status.HTTP_400_BAD_REQUEST
                )
                
        # Validate that the user is not already a member of another startup
        existing_member = TeamMember.objects.filter(user=user)
        if existing_member.exists():
            return error_response(
                f"{user.full_name} is already a member of {existing_member.first().startup.name}", 
                'already_team_member', 
                status.HTTP_400_BAD_REQUEST
            )
        
        # If this is a team leader, ensure there's not already a team leader for this startup
        if is_team_leader:
            existing_startup_leader = TeamMember.objects.filter(startup=startup, role_in_team='Team Leader')
            if existing_startup_leader.exists():
                return error_response(
                    f"{startup.name} already has a team leader: {existing_startup_leader.first().user.full_name}", 
                    'startup_has_leader', 
                    status.HTTP_400_BAD_REQUEST
                )
        
        # All validations passed, create the team member
        serializer = TeamMemberSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
#@authentication_classes([JWTAuthentication])
#@permission_classes([IsAuthenticated])
def remove_team_member(request, startup_id, member_id):
    try:
        member = TeamMember.objects.get(startup_id=startup_id, id=member_id)
    except TeamMember.DoesNotExist:
        return error_response('Member not found', 'member_not_found', status.HTTP_404_NOT_FOUND)
    #if request.user != member.startup.user and not is_admin(request.user):
    #    return error_response('Permission denied', 'permission_denied', status.HTTP_403_FORBIDDEN)
    member.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

# -------------------------------
# APPLICATIONS
# -------------------------------

@api_view(['GET', 'POST'])
@authentication_classes([])
@permission_classes([AllowAny])
@throttle_classes([BurstRateThrottle])
def applications_list(request):
    if request.method == 'GET':
        applications = Application.objects.all()
        serializer = ApplicationSerializer(applications, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = ApplicationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@authentication_classes([])
@permission_classes([AllowAny])
def application_detail(request, id):
    try:
        application = Application.objects.get(id=id)
    except Application.DoesNotExist:
        return error_response('Application not found', 'application_not_found', status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        serializer = ApplicationSerializer(application)
        return Response(serializer.data)
    elif request.method == 'PUT':
        if not is_admin(request.user):
            return error_response('Admin required', 'admin_required', status.HTTP_403_FORBIDDEN)
        serializer = ApplicationSerializer(application, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        if not is_admin(request.user):
            return error_response('Admin required', 'admin_required', status.HTTP_403_FORBIDDEN)
        application.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['PUT'])
@authentication_classes([])
@permission_classes([AllowAny])
def application_status_update(request, id):
    try:
        application = Application.objects.get(id=id)
    except Application.DoesNotExist:
        return error_response('Application not found', 'application_not_found', status.HTTP_404_NOT_FOUND)
    if not is_admin(request.user):
        return error_response('Admin required', 'admin_required', status.HTTP_403_FORBIDDEN)
    serializer = ApplicationSerializer(application, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def application_average_score(request, id):
    result = ApplicationScore.objects.filter(application_id=id).aggregate(avg=Avg('score'))
    avg = result['avg'] if result['avg'] is not None else 0
    return Response({'average_score': avg})

@api_view(['GET', 'POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def application_votes(request, id):
    if request.method == 'GET':
        votes = ApplicationVote.objects.filter(application_id=id)
        serializer = ApplicationVoteSerializer(votes, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        data = request.data.copy()
        data['application'] = id
        serializer = ApplicationVoteSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def application_scores(request, id):
    if request.method == 'GET':
        scores = ApplicationScore.objects.filter(application_id=id)
        serializer = ApplicationScoreSerializer(scores, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        data = request.data.copy()
        data['application'] = id
        serializer = ApplicationScoreSerializer(data=data)
        if serializer.is_valid():
            score_obj = serializer.save()
            return Response(ApplicationScoreSerializer(score_obj).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# -------------------------------
# STAGES
# -------------------------------

@api_view(['GET', 'POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def stages_list(request):
    if request.method == 'GET':
        stages = Stage.objects.all()
        serializer = StageSerializer(stages, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = StageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@authentication_classes([])
@permission_classes([AllowAny])
def stage_detail(request, id):
    try:
        stage = Stage.objects.get(id=id)
    except Stage.DoesNotExist:
        return error_response('Stage not found', 'stage_not_found', status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        serializer = StageSerializer(stage)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = StageSerializer(stage, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        stage.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# -------------------------------
# DELIVERABLES & EVALUATIONS
# -------------------------------

@api_view(['GET', 'POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def deliverables_list(request):
    if request.method == 'GET':
        deliverables = Deliverable.objects.all()
        serializer = DeliverableSerializer(deliverables, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = DeliverableSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def deliverable_detail(request, id):
    try:
        deliverable = Deliverable.objects.get(id=id)
    except Deliverable.DoesNotExist:
        return error_response('Deliverable not found', 'deliverable_not_found', status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        serializer = DeliverableSerializer(deliverable)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = DeliverableSerializer(deliverable, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        deliverable.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def evaluate_deliverable(request, id):
    data = request.data.copy()
    data['deliverable'] = id
    serializer = DeliverableEvaluationSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def deliverable_evaluations(request, id):
    evaluations = DeliverableEvaluation.objects.filter(deliverable=id)
    serializer = DeliverableEvaluationSerializer(evaluations, many=True)
    return Response(serializer.data)

# -------------------------------
# RESOURCE MANAGEMENT
# -------------------------------
'''
@api_view(['GET', 'POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def resources_list(request):
    if request.method == 'GET':
        resources = Resource.objects.all()
        serializer = ResourceSerializer(resources, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = ResourceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def resource_detail(request, id):
    try:
        resource = Resource.objects.get(id=id)
    except Resource.DoesNotExist:
        return error_response('Resource not found', 'resource_not_found', status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        serializer = ResourceSerializer(resource)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = ResourceSerializer(resource, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        resource.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def resource_requests_list(request):
    if request.method == 'GET':
        reqs = ResourceRequest.objects.all()
        serializer = ResourceRequestSerializer(reqs, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = ResourceRequestSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def resource_allocations_list(request):
    if request.method == 'GET':
        allocations = ResourceAllocation.objects.all()
        serializer = ResourceAllocationSerializer(allocations, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = ResourceAllocationSerializer(data=request.data)
        if serializer.is_valid():
            allocation = serializer.save()
            return Response(ResourceAllocationSerializer(allocation).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
'''
# -------------------------------
# EVENTS
# -------------------------------

@api_view(['GET', 'POST'])
# @permission_classes([])  # Allow all requests without authentication
def events_list(request):
    if request.method == 'GET':
        events = Event.objects.all()
        serializer = EventSerializer(events, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        # Check if the user exists
        user_id = request.data.get('user')
        if user_id:
            try:
                User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response(
                    {"user": [f"Invalid pk \"{user_id}\" - object does not exist."]},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        serializer = EventSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
# Remove authentication for event detail view
@authentication_classes([])
@permission_classes([AllowAny])
def event_detail(request, id):
    """
    Get, update or delete an event
    """
    try:
        event = Event.objects.get(id=id)
    except Event.DoesNotExist:
        return Response(
            {'error': 'Event not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'GET':
        serializer = EventSerializer(event)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        # Remove authentication check
        # if request.user != event.user and not is_admin(request.user):
        #     return error_response('Permission denied', 'permission_denied', status.HTTP_403_FORBIDDEN)
        
        serializer = EventSerializer(event, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # Remove authentication check
        # if request.user != event.user and not is_admin(request.user):
        #     return error_response('Permission denied', 'permission_denied', status.HTTP_403_FORBIDDEN)
        
        event.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
# -------------------------------
# JURY EVALUATIONS
# -------------------------------

@api_view(['GET', 'POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def jury_evaluations_list(request):
    if request.method == 'GET':
        evaluations = JuryEvaluation.objects.all()
        serializer = JuryEvaluationSerializer(evaluations, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = JuryEvaluationSerializer(data=request.data)
        if serializer.is_valid():
            evaluation = serializer.save()
            return Response(JuryEvaluationSerializer(evaluation).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def jury_evaluation_detail(request, id):
    try:
        evaluation = JuryEvaluation.objects.get(id=id)
    except JuryEvaluation.DoesNotExist:
        return error_response('Jury evaluation not found', 'evaluation_not_found', status.HTTP_404_NOT_FOUND)
    serializer = JuryEvaluationSerializer(evaluation)
    return Response(serializer.data)

# -------------------------------
# FILE MANAGEMENT
# -------------------------------

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def upload_file(request):
    serializer = FileMetadataSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def list_files(request):
    files = FileMetadata.objects.all()
    serializer = FileMetadataSerializer(files, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def file_detail(request, id):
    try:
        file_meta = FileMetadata.objects.get(id=id)
    except FileMetadata.DoesNotExist:
        return error_response('File not found', 'file_not_found', status.HTTP_404_NOT_FOUND)
    serializer = FileMetadataSerializer(file_meta)
    return Response(serializer.data)

# -------------------------------
# NOTIFICATIONS
# -------------------------------

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def notifications_list(request):
    notifications = Notification.objects.filter(user=request.user)
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)

@api_view(['PUT'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, id):
    try:
        note = Notification.objects.get(id=id)
    except Notification.DoesNotExist:
        return error_response('Notification not found', 'notification_not_found', status.HTTP_404_NOT_FOUND)
    note.is_read = True
    note.save()
    return Response({'message': 'Notification marked as read'})

@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_notification(request, id):
    try:
        note = Notification.objects.get(id=id)
    except Notification.DoesNotExist:
        return error_response('Notification not found', 'notification_not_found', status.HTTP_404_NOT_FOUND)
    note.delete()
    return Response({'message': 'Notification deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

# -------------------------------
# INCUBATION FORM
# -------------------------------

@api_view(['GET', 'POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def incubation_forms_list(request):
    if request.method == 'GET':
        incubation_forms = IncubationForm.objects.all()
        serializer = IncubationFormListSerializer(incubation_forms, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = IncubationFormSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(status='pending')
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@authentication_classes([])
@permission_classes([AllowAny])
def incubation_form_detail(request, id):
    try:
        incubation_form = IncubationForm.objects.get(id=id)
    except IncubationForm.DoesNotExist:
        return error_response('Incubation form not found', 'form_not_found', status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = IncubationFormDetailSerializer(incubation_form)
        return Response(serializer.data)
    elif request.method == 'PUT':
        # if not is_admin(request.user):
        #     return error_response('Admin required', 'admin_required', status.HTTP_403_FORBIDDEN)
        serializer = IncubationFormSerializer(incubation_form, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        # if not is_admin(request.user):
        #     return error_response('Admin required', 'admin_required', status.HTTP_403_FORBIDDEN)
        incubation_form.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['PUT'])
@authentication_classes([])
@permission_classes([AllowAny])
def incubation_form_status_update(request, id):
    try:
        incubation_form = IncubationForm.objects.get(id=id)
    except IncubationForm.DoesNotExist:
        return error_response('Incubation form not found', 'form_not_found', status.HTTP_404_NOT_FOUND)
    
    # if not is_admin(request.user):
    #     return error_response('Admin required', 'admin_required', status.HTTP_403_FORBIDDEN)
    
    status_value = request.data.get('status')
    if status_value not in dict(IncubationForm.STATUS_CHOICES).keys():
        return Response(
            {'error': 'Invalid status value'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    incubation_form.status = status_value
    incubation_form.save()
    serializer = IncubationFormDetailSerializer(incubation_form)
    return Response(serializer.data)

@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def pending_incubation_forms(request):
    pending_forms = IncubationForm.objects.filter(status='pending')
    paginator = StandardPagination()
    page = paginator.paginate_queryset(pending_forms, request)
    serializer = IncubationFormListSerializer(page, many=True)
    return paginator.get_paginated_response(serializer.data)

@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def my_incubation_submissions(request):
    try:
        # Add the authenticated user to the data before validation
        data = request.data.copy()
        # data['user'] = request.user.id  # Associate the form with the authenticated user
        
        serializer = IncubationFormSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"success": "Form submitted successfully"},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


from .models import User, Role
from .serializers import UserSerializer
from .utils import is_admin, error_response

@api_view(['GET'])
#@permission_classes([])  # Allow all requests without authentication
def mentors_list(request):
    """
    Get all users with the mentor role
    """
    try:
        mentor_role = Role.objects.get(name='mentor')
        mentors = User.objects.filter(role=mentor_role)
        serializer = UserSerializer(mentors, many=True)
        return Response(serializer.data)
    except Role.DoesNotExist:
        return error_response('Mentor role not found', 'role_not_found', status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
#@permission_classes([])  # Allow all requests without authentication
def trainers_list(request):
    """
    Get all users with the trainer role
    """
    try:
        trainer_role = Role.objects.get(name='trainer')
        trainers = User.objects.filter(role=trainer_role)
        serializer = UserSerializer(trainers, many=True)
        return Response(serializer.data)
    except Role.DoesNotExist:
        return error_response('Trainer role not found', 'role_not_found', status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
# TEMPORARY: Comment out authentication for development
#@authentication_classes([JWTAuthentication])
#@permission_classes([IsAuthenticated])
def create_mentor(request):
    """
    Create a new mentor (user with mentor role)
    """
    # TEMPORARY: Comment out admin check for development
    # if not is_admin(request.user):
    #     return error_response('Admin required', 'admin_required', status.HTTP_403_FORBIDDEN)
    
    try:
        # Get the mentor role explicitly
        mentor_role = Role.objects.get(name='mentor')
        
        # Create a copy of the request data
        data = request.data.copy()
        
        # Set the role ID in the data, overriding any 'role' sent from frontend
        data['role'] = mentor_role.id
        
        # Create the user with the provided data
        serializer = UserSerializer(data=data)
        if serializer.is_valid():
            # Save the user with the mentor role
            user = serializer.save()
            # Return the serialized user data (includes role_name)
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except Role.DoesNotExist:
        return error_response('Mentor role not found in database.', 'role_not_found', status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        # Log the exception for debugging
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error in create_mentor: {str(e)}")
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
# TEMPORARY: Comment out authentication for development
#@authentication_classes([JWTAuthentication])
#@permission_classes([IsAuthenticated])
def create_trainer(request):
    """
    Create a new trainer (user with trainer role)
    """
    # TEMPORARY: Comment out admin check for development
    # if not is_admin(request.user):
    #     return error_response('Admin required', 'admin_required', status.HTTP_403_FORBIDDEN)
    
    try:
        # Get the trainer role
        trainer_role = Role.objects.get(name='trainer')
        
        # Create a copy of the request data
        data = request.data.copy()
        
        # Set the role ID in the data
        data['role'] = trainer_role.id
        
        # Create the serializer with the data
        serializer = UserSerializer(data=data)
        
        if serializer.is_valid():
            # Save the user with the trainer role
            user = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except Role.DoesNotExist:
        return error_response('Trainer role not found', 'role_not_found', status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET', 'PUT', 'DELETE'])
# Remove authentication for mentor detail view
@authentication_classes([])
@permission_classes([AllowAny])
def mentor_detail(request, id):
    """
    Get, update or delete a mentor
    """
    try:
        try:
            mentor_role = Role.objects.get(name='mentor')
        except Role.DoesNotExist:
            return Response(
                {'error': 'Mentor role not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
            
        try:
            mentor = User.objects.get(id=id, role=mentor_role)
        except User.DoesNotExist:
            return Response(
                {'error': 'Mentor not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        if request.method == 'GET':
            serializer = UserSerializer(mentor)
            return Response(serializer.data)
        
        elif request.method == 'PUT':
            # Remove the admin check that's causing issues
            # if not is_admin(request.user):
            #     return error_response('Admin required', 'admin_required', status.HTTP_403_FORBIDDEN)
            
            data = request.data.copy()
            data['role'] = mentor_role.id  # Ensure role remains as mentor
            
            serializer = UserSerializer(mentor, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        elif request.method == 'DELETE':
            # Remove the admin check that's causing issues
            # if not is_admin(request.user):
            #     return error_response('Admin required', 'admin_required', status.HTTP_403_FORBIDDEN)
            
            mentor.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
    
    except Exception as e:
        # Log the error for debugging
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error in mentor_detail: {str(e)}")
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
@api_view(['GET', 'PUT', 'DELETE'])
# TEMPORARY: Comment out authentication for development
#@authentication_classes([JWTAuthentication])
#@permission_classes([IsAuthenticated])
def trainer_detail(request, id):
    """
    Get, update or delete a trainer
    """
    try:
        trainer_role = Role.objects.get(name='trainer')
        try:
            trainer = User.objects.get(id=id, role=trainer_role)
        except User.DoesNotExist:
            return error_response('Trainer not found', 'trainer_not_found', status.HTTP_404_NOT_FOUND)
        
        if request.method == 'GET':
            serializer = UserSerializer(trainer)
            return Response(serializer.data)
        
        elif request.method == 'PUT':
            # TEMPORARY: Skip admin check for development
            # if not is_admin(request.user):
            #     return error_response('Admin required', 'admin_required', status.HTTP_403_FORBIDDEN)
            
            data = request.data.copy()
            data['role'] = trainer_role.id  # Ensure role remains as trainer
            
            serializer = UserSerializer(trainer, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        elif request.method == 'DELETE':
            # TEMPORARY: Skip admin check for development
            # if not is_admin(request.user):
            #     return error_response('Admin required', 'admin_required', status.HTTP_403_FORBIDDEN)
            
            trainer.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
    
    except Role.DoesNotExist:
        return error_response('Trainer role not found', 'role_not_found', status.HTTP_404_NOT_FOUND)
    except Exception as e:
        # Log the exception for debugging
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error in trainer_detail: {str(e)}")
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils import timezone
from django.db.models import Count, Q, Sum
from datetime import timedelta

from .models import (
    User, Startup, Application, Resource, ResourceRequest, Event, Role
)

@api_view(['GET'])
@permission_classes([AllowAny])
def dashboard_stats(request):
    """
    Get dashboard summary statistics
    """
    now = timezone.now()
    one_week_later = now + timedelta(days=7)
    
    # Count active startups
    active_startups = Startup.objects.filter(status='approved').count()
    
    # Count pending applications
    pending_applications = Application.objects.filter(status='pending').count()
    
    # Count pending incubation forms (if applicable)
    pending_forms = 0
    try:
        from .models import IncubationForm
        pending_forms = IncubationForm.objects.filter(status='pending').count()
    except ImportError:
        pass
    
    # Count mentors
    mentor_role = Role.objects.filter(name='mentor').first()
    mentors_count = User.objects.filter(role=mentor_role).count() if mentor_role else 0
    
    # Count trainers
    trainer_role = Role.objects.filter(name='trainer').first()
    trainers_count = User.objects.filter(role=trainer_role).count() if trainer_role else 0
    
    # Count upcoming events
    upcoming_events = Event.objects.filter(start_time__gt=now).count()
    
    # Count events this week
    events_this_week = Event.objects.filter(
        start_time__gt=now,
        start_time__lt=one_week_later
    ).count()
    
    return Response({
        'active_startups': active_startups,
        'pending_applications': pending_applications,
        'pending_forms': pending_forms,
        'mentors_count': mentors_count,
        'trainers_count': trainers_count,
        'upcoming_events': upcoming_events,
        'events_this_week': events_this_week
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def startup_status_analytics(request):
    """
    Get analytics on startup statuses
    """
    statuses = Startup.objects.values('status').annotate(count=Count('status'))
    
    # Format the data for the frontend
    result = []
    for status in statuses:
        result.append({
            'name': status['status'].capitalize(),
            'value': status['count']
        })
    
    return Response(result)

@api_view(['GET'])
@permission_classes([AllowAny])
def application_status_analytics(request):
    """
    Get analytics on application statuses
    """
    statuses = Application.objects.values('status').annotate(count=Count('status'))
    
    # Format the data for the frontend
    result = []
    for status in statuses:
        result.append({
            'name': status['status'].capitalize(),
            'value': status['count']
        })
    
    return Response(result)

@api_view(['GET'])
@permission_classes([AllowAny])
def resource_utilization_analytics(request):
    """
    Get analytics on resource utilization
    """
    resources = Resource.objects.all()
    result = []
    
    for resource in resources:
        # Calculate used resources
        used = ResourceRequest.objects.filter(
            resource=resource,
            status='approved'
        ).aggregate(total=Sum('quantity_requested'))['total'] or 0
        
        available = max(0, resource.quantity_available - used)
        
        result.append({
            'name': resource.name,
            'total': resource.quantity_available,
            'used': used,
            'available': available
        })
    
    return Response(result)

@api_view(['GET'])
@permission_classes([AllowAny])
def acceptance_rate_analytics(request):
    """
    Get analytics on application acceptance rate
    """
    # Get total applications
    total_applications = Application.objects.count()
    
    # Get accepted applications
    accepted_applications = Application.objects.filter(status='approved').count()
    
    # Calculate acceptance rate
    rate = 0
    if total_applications > 0:
        rate = round((accepted_applications / total_applications) * 100)
    
    return Response({
        'rate': rate,
        'period': 'Q4 2023',
        'accepted': accepted_applications,
        'total': total_applications
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def survival_rate_analytics(request):
    """
    Get analytics on startup survival rate
    """
    # Get total startups
    total_startups = Startup.objects.count()
    
    # Get active startups
    active_startups = Startup.objects.filter(status='approved').count()
    
    # Calculate survival rate
    rate = 0
    if total_startups > 0:
        rate = round((active_startups / total_startups) * 100)
    
    return Response({
        'rate': rate,
        'period': '6 months',
        'survived': active_startups,
        'total': total_startups
    })

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from .models import Resource, ResourceRequest, ResourceAllocation
from .serializers import ResourceSerializer, ResourceRequestSerializer, ResourceAllocationSerializer

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])  # Allow access without authentication for now
def resources_list(request):
    if request.method == 'GET':
        resources = Resource.objects.all()
        serializer = ResourceSerializer(resources, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = ResourceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])  # Allow access without authentication for now
def resource_detail(request, id):
    try:
        resource = Resource.objects.get(id=id)
    except Resource.DoesNotExist:
        return Response({'error': 'Resource not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = ResourceSerializer(resource)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = ResourceSerializer(resource, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        resource.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])  # Allow access without authentication for now
def resource_requests_list(request):
    if request.method == 'GET':
        reqs = ResourceRequest.objects.all()
        serializer = ResourceRequestSerializer(reqs, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = ResourceRequestSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])  # Allow access without authentication for now
def resource_allocations_list(request):
    if request.method == 'GET':
        allocations = ResourceAllocation.objects.all()
        serializer = ResourceAllocationSerializer(allocations, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = ResourceAllocationSerializer(data=request.data)
        if serializer.is_valid():
            allocation = serializer.save()
            return Response(ResourceAllocationSerializer(allocation).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



from .models import IncubationForm, IncubationFormScore
@api_view(['GET', 'POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def incubation_form_scores(request, id):
    try:
        incubation_form = IncubationForm.objects.get(id=id)
    except IncubationForm.DoesNotExist:
        return Response({'error': 'Incubation form not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        # Get existing scores
        try:
            score = IncubationFormScore.objects.filter(incubation_form_id=id).first()
            if score:
                return Response({
                    'problem_understanding': score.problem_understanding,
                    'solution_fit': score.solution_fit,
                    'technical_soundness': score.technical_soundness,
                    'total_score': score.total_score()
                })
            return Response({}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    elif request.method == 'POST':
        # Create or update scores
        problem_understanding = request.data.get('problem_understanding', 0)
        solution_fit = request.data.get('solution_fit', 0)
        technical_soundness = request.data.get('technical_soundness', 0)
        
        try:
            score, created = IncubationFormScore.objects.update_or_create(
                incubation_form=incubation_form,
                defaults={
                    'problem_understanding': problem_understanding,
                    'solution_fit': solution_fit,
                    'technical_soundness': technical_soundness
                }
            )
            
            return Response({
                'problem_understanding': score.problem_understanding,
                'solution_fit': score.solution_fit,
                'technical_soundness': score.technical_soundness,
                'total_score': score.total_score()
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
