---
sidebar_position: 2
---

# GroupMember Model

The `GroupMember` model represents users who are members of an expense group. Members can have different roles (admin or regular member).

## Table: `group_member`

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (PK) | Unique group member identifier (UUID) |
| `group_id` | String (FK) | Foreign key to `Group` |
| `user_id` | String (FK) | Foreign key to `User` |
| `role` | String | Member role: `admin` or `member` (default: `"member"`) |
| `joined_at` | DateTime | Timestamp when the user joined the group (default: `datetime.utcnow`) |

## Member Roles

- **`admin`** - Can manage the group, add/remove members, and modify expenses
- **`member`** - Regular member who can view and participate in expenses

## Relationships

- **`group`** (Many-to-One) → `Group` - The group this member belongs to
- **`user`** (Many-to-One) → `User` - The user who is a member

## Usage Example

```python
from src.app.models.group_member import GroupMember
from datetime import datetime

# Add a member to a group
member = GroupMember(
    id="uuid-here",
    group_id=group.id,
    user_id=user.id,
    role="member",
    joined_at=datetime.utcnow()
)

# Add an admin member
admin_member = GroupMember(
    id="uuid-here",
    group_id=group.id,
    user_id=admin_user.id,
    role="admin",
    joined_at=datetime.utcnow()
)

# Access member's group
member_group = member.group

# Access member's user details
member_user = member.user
```

## Adding Members

When creating a group, the creator should be added as an admin:

```python
# Create group
group = Group(name="Trip to Paris", created_by=creator.id, currency="EUR")

# Add creator as admin
creator_member = GroupMember(
    group_id=group.id,
    user_id=creator.id,
    role="admin"
)

# Add other members
for user in other_users:
    member = GroupMember(
        group_id=group.id,
        user_id=user.id,
        role="member"
    )
```

## Notes

- The group creator is typically added as an admin
- Members are automatically deleted when the group is deleted
- The `joined_at` timestamp tracks when users joined the group
- Only admins can typically add/remove members and modify group settings

