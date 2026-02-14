#!/usr/bin/env python
"""
Fix FormField import error
Run this script from the PROJECT ROOT
"""

import os

def fix_form_model():
    """Add FormField model to form.py"""
    file_path = "backend/app/models/form.py"
    
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return False
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if FormField already exists
    if 'class FormField' in content:
        print(f"✅ FormField already exists in {file_path}")
        return True
    
    # Find where to insert FormField class
    import_lines = []
    lines = content.split('\n')
    
    # Find the import section
    import_end = 0
    for i, line in enumerate(lines):
        if line.startswith('from') or line.startswith('import'):
            import_lines.append(line)
        elif line.strip() == '' and import_lines:
            import_end = i + 1
            break
    
    # Create FormField class
    formfield_class = '''

class FormField(Base):
    """Individual field definition for a form"""
    __tablename__ = "form_fields"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    form_id = Column(String, ForeignKey("forms.id", ondelete="CASCADE"), nullable=False)
    
    field_id = Column(String, nullable=False)
    field_type = Column(String, nullable=False)
    label = Column(String, nullable=False)
    placeholder = Column(String, nullable=True)
    required = Column(Boolean, default=False)
    options = Column(JSON, default=list)
    validation_rules = Column(JSON, default=dict)
    order_index = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    form = relationship("Form", back_populates="fields_relationship")
    
    def to_dict(self):
        return {
            "id": self.id,
            "form_id": self.form_id,
            "field_id": self.field_id,
            "field_type": self.field_type,
            "label": self.label,
            "placeholder": self.placeholder,
            "required": self.required,
            "options": self.options,
            "validation_rules": self.validation_rules,
            "order_index": self.order_index,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
'''
    
    # Update Form class to include relationship
    if 'fields_relationship' not in content:
        content = content.replace(
            'submissions = relationship("FormSubmission", back_populates="form")',
            'fields_relationship = relationship("FormField", back_populates="form", cascade="all, delete-orphan")\n    submissions = relationship("FormSubmission", back_populates="form")'
        )
    
    # Insert FormField class after imports
    new_content = '\n'.join(lines[:import_end]) + formfield_class + '\n' + '\n'.join(lines[import_end:])
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"✅ Added FormField model to {file_path}")
    return True

def fix_init_file():
    """Fix __init__.py to include FormField if needed"""
    file_path = "backend/app/models/__init__.py"
    
    if not os.path.exists(file_path):
        print(f"⚠️ File not found: {file_path}")
        return False
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if FormField is already imported
    if 'FormField' in content:
        print(f"✅ FormField already imported in {file_path}")
        return True
    
    # Add FormField to import
    new_content = content.replace(
        'from app.models.form import Form, FormSubmission',
        'from app.models.form import Form, FormField, FormSubmission'
    )
    new_content = new_content.replace(
        '"Form", "FormSubmission"',
        '"Form", "FormField", "FormSubmission"'
    )
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"✅ Added FormField import to {file_path}")
    return True

if __name__ == "__main__":
    print("🔧 Fixing FormField import error...")
    print("=" * 50)
    
    fix_form_model()
    fix_init_file()
    
    print("=" * 50)
    print("✅ Fix script completed!")
    print("\n🚀 Now restart your backend server:")
    print("   cd backend")
    print("   venv\\Scripts\\activate")
    print("   uvicorn app.main:app --reload")