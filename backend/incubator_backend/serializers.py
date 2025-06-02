from rest_framework import serializers
from .models import (
    User, Role, Startup, TeamMember, Application, ApplicationVote,
    ApplicationScore, Stage, Deliverable, DeliverableEvaluation, Resource,
    ResourceRequest, ResourceAllocation, Event, JuryEvaluation,
    FileMetadata, Notification , IncubationForm
)
# Create this in a file like auth_views.py or in your views.py
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView


from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from incubator_backend.models import User
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise AuthenticationFailed('No active account found with the given credentials')

        if not user.check_password(password):
            raise AuthenticationFailed('Incorrect password')

        if not user.is_active:
            raise AuthenticationFailed('Account disabled, contact admin')

        refresh = self.get_token(user)

        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'email': user.email,
                'full_name': user.full_name,
                'role': user.role.name if user.role else None,
            }
        }

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'



class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    role_name = serializers.StringRelatedField(source='role', read_only=True)
    role = serializers.PrimaryKeyRelatedField(queryset=Role.objects.all(), required=True)

    class Meta:
        model = User
        fields = ['id', 'full_name', 'email', 'password', 'role', 'role_name']
        extra_kwargs = {
            'role': {'required': True},  # Make role field required
        }

    # Commenting out email validation for now
    '''
    def validate_email(self, value):
        # ✅ Check that the email ends with "@ensia.edu.dz"
        if not value.lower().endswith("@ensia.edu.dz"):
            raise serializers.ValidationError("Only ENSIA emails (@ensia.edu.dz) are allowed.")
        return value
    '''

    def create(self, validated_data):
        # Extract the role from validated_data
        role = validated_data.pop('role')
        
        # Create the user instance
        user = User.objects.create(
            full_name=validated_data['full_name'],
            email=validated_data['email'],
            role=role  # Set the role directly
        )
        
        # Set the password
        user.set_password(validated_data['password'])
        user.save()
        
        return user
class SignupUserSerializer(serializers.ModelSerializer):
    """
    Serializer specifically for user signup/registration.
    Automatically assigns the student role.
    """
    password = serializers.CharField(write_only=True, required=True)
    role_name = serializers.StringRelatedField(source='role', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'full_name', 'email', 'password', 'role', 'role_name']
        extra_kwargs = {
            'role': {'read_only': True}  
        }

    def validate_email(self, value):
        # Check that the email ends with "@ensia.edu.dz"
        if not value.lower().endswith("@ensia.edu.dz"):
            raise serializers.ValidationError("Only ENSIA emails (@ensia.edu.dz) are allowed.")
        return value

    def create(self, validated_data):
        from .models import Role
        try:
            student_role = Role.objects.get(name="student")
        except Role.DoesNotExist:
            raise serializers.ValidationError({"role": "Student role not found. Please create it first."})

        user = User(
            full_name=validated_data['full_name'],
            email=validated_data['email'],
            role=student_role,
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


'''
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    role_name = serializers.StringRelatedField(source='role', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'full_name', 'email', 'password', 'role', 'role_name']
        extra_kwargs = {'role': {'write_only': True}}

    def create(self, validated_data):
        user = User(
            full_name=validated_data['full_name'],
            email=validated_data['email'],
            role=validated_data['role']
        )
        user.set_password(validated_data['password'])  
        user.save()
        return user
'''
class StartupSerializer(serializers.ModelSerializer):
    team_members = serializers.SerializerMethodField()
    team_leader = serializers.SerializerMethodField()
    
    class Meta:
        model = Startup
        fields = ['id', 'name', 'description', 'status', 'user', 'stage', 'created_at', 'updated_at', 'team_members', 'team_leader']
    
    def get_team_members(self, obj):
        # Get all team members who are not team leaders
        members = TeamMember.objects.filter(startup=obj).exclude(role_in_team='Team Leader')
        return TeamMemberSerializer(members, many=True).data
    
    def get_team_leader(self, obj):
        # Get the team leader if exists
        try:
            leader = TeamMember.objects.get(startup=obj, role_in_team='Team Leader')
            leader_data = TeamMemberSerializer(leader).data
            # Add the user's full_name directly to the team_leader for easier access
            if leader_data and 'user_details' in leader_data:
                leader_data['full_name'] = leader_data['user_details']['full_name']
                leader_data['email'] = leader_data['user_details']['email']
            return leader_data
        except TeamMember.DoesNotExist:
            return None
        except TeamMember.MultipleObjectsReturned:
            # In case there are multiple team leaders (shouldn't happen with constraints)
            leaders = TeamMember.objects.filter(startup=obj, role_in_team='Team Leader')
            leader_data = TeamMemberSerializer(leaders.first()).data
            # Add the user's full_name directly to the team_leader
            if leader_data and 'user_details' in leader_data:
                leader_data['full_name'] = leader_data['user_details']['full_name']
                leader_data['email'] = leader_data['user_details']['email']
            return leader_data

class TeamMemberSerializer(serializers.ModelSerializer):
    # Add serialized user details
    user_details = serializers.SerializerMethodField()
    
    class Meta:
        model = TeamMember
        fields = ['id', 'role_in_team', 'startup', 'user', 'user_details']
    
    def get_user_details(self, obj):
        return {
            'id': obj.user.id,
            'full_name': obj.user.full_name,
            'email': obj.user.email,
            'role': obj.user.role.name if obj.user.role else None
        }

class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = '__all__'

class ApplicationVoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationVote
        fields = '__all__'
        validators = [
            serializers.UniqueTogetherValidator(
                queryset=ApplicationVote.objects.all(),
                fields=('application', 'user'),
                message='User can vote only once per application.'
            )
        ]

class ApplicationScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationScore
        fields = '__all__'
        validators = [
            serializers.UniqueTogetherValidator(
                queryset=ApplicationScore.objects.all(),
                fields=('application', 'user'),
                message='User can score only once per application.'
            )
        ]

class StageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stage
        fields = '__all__'

class DeliverableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Deliverable
        fields = '__all__'

class DeliverableEvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliverableEvaluation
        fields = '__all__'

class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = '__all__'

class ResourceRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResourceRequest
        fields = '__all__'

    def validate(self, data):
        resource = data.get('resource')
        quantity_requested = data.get('quantity_requested')
        if quantity_requested > resource.quantity_available:
            raise serializers.ValidationError("Requested quantity exceeds available resources.")
        return data

class ResourceAllocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResourceAllocation
        fields = '__all__'

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'

    def validate(self, data):
        if data['end_time'] <= data['start_time']:
            raise serializers.ValidationError("Event end time must be after start time.")
        return data

class JuryEvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = JuryEvaluation
        fields = '__all__'

class FileMetadataSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileMetadata
        fields = '__all__'

    def validate(self, data):
        deliverable = data.get('deliverable')
        application = data.get('application')
        if not (deliverable or application):
            raise serializers.ValidationError("File must be linked to a deliverable or application.")
        if deliverable and application:
            raise serializers.ValidationError("File cannot be linked to both deliverable and application.")
        return data

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'





class IncubationFormSerializer(serializers.ModelSerializer):
    """
    Serializer for the IncubationForm model.
    Handles serialization and deserialization of IncubationForm instances.
    """
    class Meta:
        model = IncubationForm
        fields = [
            'id', 'timestamp', 'project_id', 'team_leader_name', 'team_leader_year', 
            'team_leader_email', 'team_leader_phone', 'team_members', 'project_title', 
            'project_domain', 'is_ai_project', 'project_summary', 'dev_stage', 
            'demo_link', 'project_video', 'key_milestones', 'current_challenges', 
            'problem_statement', 'target_audience', 'expected_impact', 
            'additional_motivation', 'supporting_documents', 'confirmation', 
            'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['timestamp', 'created_at', 'updated_at', 'status']
        extra_kwargs = {
            'project_domain': {'required': False, 'allow_null': True},
            'is_ai_project': {'required': False, 'allow_null': True},
            'dev_stage': {'required': False, 'allow_null': True},
            'project_video': {'required': False, 'allow_null': True},
            'additional_motivation': {'required': False, 'allow_null': True},
            'supporting_documents': {'required': False, 'allow_null': True},
            'team_leader_year': {'required': False, 'allow_null': True},
        }

    def validate(self, data):
        # Keep project_id uniqueness check
        project_id = data.get('project_id')
        instance = self.instance
        if project_id and IncubationForm.objects.filter(project_id=project_id).exclude(id=instance.id if instance else None).exists():
            raise serializers.ValidationError({"project_id": "A project with this ID already exists."})

        # Keep confirmation check
        if not data.get('confirmation'):
            raise serializers.ValidationError({"confirmation": "You must confirm that the information is accurate."})

        return data

class IncubationFormListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for listing incubation forms.
    """
    class Meta:
        model = IncubationForm
        fields = ['id', 'project_id', 'project_title', 'team_leader_name', 'team_leader_email', 'created_at', 'status']

class IncubationFormDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer that includes all fields for viewing a specific form.
    """
    class Meta:
        model = IncubationForm
        fields = [
            'id', 'timestamp', 'project_id', 'team_leader_name', 'team_leader_year', 
            'team_leader_email', 'team_leader_phone', 'team_members', 'project_title', 
            'project_domain', 'is_ai_project', 'project_summary', 'dev_stage', 
            'demo_link', 'project_video', 'key_milestones', 'current_challenges', 
            'problem_statement', 'target_audience', 'expected_impact', 
            'additional_motivation', 'supporting_documents', 'confirmation', 
            'status', 'created_at', 'updated_at'
        ]

class MentorSerializer(UserSerializer):
    assigned_startups_count = serializers.SerializerMethodField()
    
    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ['assigned_startups_count']
    
    def get_assigned_startups_count(self, obj):
        return TeamMember.objects.filter(user=obj).count()

class TrainerSerializer(UserSerializer):
    sessions_count = serializers.SerializerMethodField()
    next_session = serializers.SerializerMethodField()
    
    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ['sessions_count', 'next_session']
    
    def get_sessions_count(self, obj):
        from .models import Event
        return Event.objects.filter(user=obj).count()
    
    def get_next_session(self, obj):
        from .models import Event
        from django.utils import timezone
        upcoming_event = Event.objects.filter(
            user=obj, 
            start_time__gt=timezone.now()
        ).order_by('start_time').first()
        
        if upcoming_event:
            return {
                'id': upcoming_event.id,
                'title': upcoming_event.title,
                'start_time': upcoming_event.start_time
            }
        return None