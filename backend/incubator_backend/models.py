from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
from django.db.models import F, Q

# Enums
ROLE_CHOICES = [
    ('admin', 'Admin'),
    ('coach', 'Coach'),
    ('mentor', 'Mentor'),
    ('trainer', 'Trainer'),
    ('student', 'Student'),
]

STARTUP_STATUS_CHOICES = [
    ('pending', 'Pending'),
    ('approved', 'Approved'),
    ('rejected', 'Rejected'),
]

APPLICATION_STATUS_CHOICES = [
    ('pending', 'Pending'),
    ('approved', 'Approved'),
    ('rejected', 'Rejected'),
]

DELIVERABLE_STATUS_CHOICES = [
    ('pending', 'Pending'),
    ('submitted', 'Submitted'),
    ('reviewed', 'Reviewed'),
]

RESOURCE_REQUEST_STATUS_CHOICES = [
    ('pending', 'Pending'),
    ('approved', 'Approved'),
    ('rejected', 'Rejected'),
]

# Models

class Role(models.Model):
    name = models.CharField(max_length=20, choices=ROLE_CHOICES, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'roles'


class User(models.Model):
    full_name = models.CharField(max_length=30)
    email = models.EmailField(unique=True)
    password_hash = models.CharField(max_length=128)
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)  # ✅ Optional, good for admin access

    def set_password(self, raw_password):
        self.password_hash = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password_hash)

    def __str__(self):
        return self.full_name

    class Meta:
        db_table = 'users'


class Stage(models.Model):
    name = models.CharField(max_length=50)
    sequence_order = models.IntegerField()
    duration_months = models.IntegerField()

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'stages'

class Startup(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=STARTUP_STATUS_CHOICES,
        default='pending'
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    stage = models.ForeignKey(Stage, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'startups'


class TeamMember(models.Model):
    role_in_team = models.CharField(max_length=50)
    startup = models.ForeignKey(Startup, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        db_table = 'team_members'
        unique_together = ('startup', 'user')
    
    def clean(self):
        # Validate that user is a student
        if hasattr(self.user, 'role') and self.user.role and self.user.role.name != 'student':
            raise ValidationError(f"Team members must be students, but {self.user.full_name} has role {self.user.role.name}")
        
        # Validate that user is not already in another startup
        if self.role_in_team == 'Team Leader':
            existing_leader = TeamMember.objects.filter(
                user=self.user, 
                role_in_team='Team Leader'
            ).exclude(pk=self.pk)
            
            if existing_leader.exists():
                raise ValidationError(f"{self.user.full_name} is already a team leader for another startup")
        
        # Check if user is already in another startup (any role)
        existing_member = TeamMember.objects.filter(user=self.user).exclude(pk=self.pk)
        if existing_member.exists():
            raise ValidationError(f"{self.user.full_name} is already a member of another startup")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.full_name} in {self.startup.name}"


class Application(models.Model):
    status = models.CharField(
        max_length=20,
        choices=APPLICATION_STATUS_CHOICES,
        default='pending'
    )
    submitted_at = models.DateTimeField(auto_now_add=True)
    google_form_url = models.URLField(blank=True, null=True)
    startup = models.ForeignKey(Startup, on_delete=models.CASCADE)

    def __str__(self):
        return f"Application for {self.startup.name}"

    class Meta:
        db_table = 'applications'


class ApplicationVote(models.Model):
    vote = models.BooleanField()
    voted_at = models.DateTimeField(auto_now_add=True)
    application = models.ForeignKey(Application, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        db_table = 'application_votes'
        unique_together = ('application', 'user')

    def __str__(self):
        return f"Vote by {self.user.full_name} on {self.application.id}"


class ApplicationScore(models.Model):
    score = models.DecimalField(max_digits=5, decimal_places=2)
    scored_at = models.DateTimeField(auto_now_add=True)
    application = models.ForeignKey(Application, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        db_table = 'application_scores'
        unique_together = ('application', 'user')

    def __str__(self):
        return f"Score {self.score} by {self.user.full_name}"



class Deliverable(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    due_date = models.DateField()
    submission_url = models.URLField(blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=DELIVERABLE_STATUS_CHOICES,
        default='pending'
    )
    submitted_at = models.DateTimeField(blank=True, null=True)
    stage = models.ForeignKey(Stage, on_delete=models.CASCADE)
    startup = models.ForeignKey(Startup, on_delete=models.CASCADE)

    def __str__(self):
        return self.title

    class Meta:
        db_table = 'deliverables'


class DeliverableEvaluation(models.Model):
    score = models.DecimalField(max_digits=5, decimal_places=2)
    comments = models.TextField(blank=True)
    evaluated_at = models.DateTimeField(auto_now_add=True)
    deliverable = models.ForeignKey(Deliverable, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return f"Evaluation for {self.deliverable.title}"

    class Meta:
        db_table = 'deliverable_evaluations'


class Resource(models.Model):
    type = models.CharField(max_length=50)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    quantity_available = models.IntegerField()

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'resources'


class ResourceRequest(models.Model):
    quantity_requested = models.IntegerField()
    status = models.CharField(
        max_length=20,
        choices=RESOURCE_REQUEST_STATUS_CHOICES,
        default='pending'
    )
    requested_at = models.DateTimeField(auto_now_add=True)
    startup = models.ForeignKey(Startup, on_delete=models.CASCADE)
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"Request {self.id} for {self.resource.name}"

    class Meta:
        db_table = 'resource_requests'


class ResourceAllocation(models.Model):
    allocated_quantity = models.IntegerField()
    allocated_at = models.DateTimeField(auto_now_add=True)
    request = models.ForeignKey(ResourceRequest, on_delete=models.CASCADE)

    def __str__(self):
        return f"Allocation {self.id} for Request {self.request.id}"

    class Meta:
        db_table = 'resource_allocations'


class Event(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    location = models.CharField(max_length=255)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def clean(self):
        if self.end_time <= self.start_time:
            raise ValidationError("The event's end time must be after its start time.")

    def __str__(self):
        return self.title

    class Meta:
        db_table = 'events'
        indexes = [
            models.Index(fields=['start_time', 'location']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(end_time__gt=models.F('start_time')),
                name='end_time_after_start_time'
            )
        ]


class JuryEvaluation(models.Model):
    score = models.DecimalField(max_digits=5, decimal_places=2)
    comments = models.TextField(blank=True)
    evaluated_at = models.DateTimeField(auto_now_add=True)
    startup = models.ForeignKey(Startup, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return f"Jury Evaluation for {self.startup.name}"

    class Meta:
        db_table = 'jury_evaluations'


class FileMetadata(models.Model):
    drive_file_id = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    url = models.URLField()
    file_type = models.CharField(max_length=50)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    deliverable = models.ForeignKey(Deliverable, on_delete=models.SET_NULL, null=True, blank=True)
    application = models.ForeignKey(Application, on_delete=models.SET_NULL, null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def clean(self):
        if (self.deliverable is None and self.application is None) or \
           (self.deliverable is not None and self.application is not None):
            raise ValidationError("FileMetadata must be linked to exactly one of deliverable or application.")

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'file_metadata'
        constraints = [
            models.CheckConstraint(
                check=(
                    models.Q(deliverable__isnull=False, application__isnull=True) |
                    models.Q(deliverable__isnull=True, application__isnull=False)
                ),
                name='exactly_one_of_deliverable_or_application'
            )
        ]


class Notification(models.Model):
    type = models.CharField(max_length=50)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return f"Notification for {self.user.email}"

    class Meta:
        db_table = 'notifications'



#form of incubation class
from django.db import models
from django.core.validators import FileExtensionValidator

class IncubationForm(models.Model):

    # Status choices for project tracking
    STATUS_CHOICES = (
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('in_progress', 'In Progress'),
    )
    
    # Development stage choices
    DEV_STAGE_CHOICES = (
        ('idea', 'Idea Stage'),
        ('prototype', 'Prototype'),
        ('mvp', 'Minimum Viable Product'),
        ('scaling', 'Scaling'),
    )
    
    # Basic information - Exactly matching the React form fields
    timestamp = models.DateTimeField(auto_now_add=True)
    project_id = models.CharField(max_length=50, unique=True, verbose_name="Project ID")
    
    # Team leader information
    team_leader_name = models.CharField(max_length=255, verbose_name="Team Leader Full Name")
    team_leader_year = models.CharField(max_length=50, verbose_name="Team Leader Year of Study")
    team_leader_email = models.EmailField(verbose_name="Team Leader Email Address")
    team_leader_phone = models.CharField(max_length=20, verbose_name="Team Leader Phone Number")
    
    # Team information
    team_members = models.TextField(verbose_name="Team Members")
    
    # Project details
    project_title = models.CharField(max_length=255, verbose_name="Project Title")
    project_domain = models.CharField(max_length=100, blank=True, verbose_name="Project Domain")
    is_ai_project = models.BooleanField(default=False, verbose_name="Is AI Project")
    project_summary = models.TextField(verbose_name="Project Summary")
    dev_stage = models.CharField(
        max_length=50, 
        choices=DEV_STAGE_CHOICES, 
        default='idea',
        verbose_name="Development Stage"
    )
    
    # Project links
    demo_link = models.URLField(verbose_name="Demo/Working Application Link")
    project_video = models.URLField(blank=True, verbose_name="Project Video")
    
    # Additional project information
    key_milestones = models.TextField(verbose_name="Key Milestones Achieved")
    current_challenges = models.TextField(verbose_name="Current Challenges")
    problem_statement = models.TextField(verbose_name="Problem Statement")
    target_audience = models.TextField(blank=True, verbose_name="Target Audience")
    expected_impact = models.TextField(verbose_name="Expected Impact")
    additional_motivation = models.TextField(blank=True, verbose_name="Additional Motivation")
    
    # Supporting documents
    supporting_documents = models.FileField(
        upload_to='incubation_documents/%Y/%m/',
        validators=[FileExtensionValidator(['pdf', 'doc', 'docx', 'ppt', 'pptx', 'zip'])],
        blank=True,
        verbose_name="Supporting Documents"
    )
    
    # Confirmation and status
    confirmation = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.project_title} - {self.project_id}"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Incubation Form"
        verbose_name_plural = "Incubation Forms"
        db_table = "incubator_backend_incubation_form"



class IncubationFormScore(models.Model):
    incubation_form = models.ForeignKey(
        IncubationForm, 
        on_delete=models.CASCADE,
        related_name='scores'
    )
    problem_understanding = models.IntegerField(default=0)
    solution_fit = models.IntegerField(default=0)
    technical_soundness = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'incubator_backend_incubation_form_score'
        
    def total_score(self):
        return self.problem_understanding + self.solution_fit + self.technical_soundness
