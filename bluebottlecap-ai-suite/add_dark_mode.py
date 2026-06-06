import os
import re

replacements = [
    (r'(?<!dark:)bg-white(?!\s+dark:bg-)', 'bg-white dark:bg-slate-900'),
    (r'(?<!dark:)bg-slate-50(?!\s+dark:bg-)', 'bg-slate-50 dark:bg-slate-950'),
    (r'(?<!dark:)bg-gray-50(?!\s+dark:bg-)', 'bg-gray-50 dark:bg-slate-900'),
    (r'(?<!dark:)text-gray-900(?!\s+dark:text-)', 'text-gray-900 dark:text-white'),
    (r'(?<!dark:)text-gray-800(?!\s+dark:text-)', 'text-gray-800 dark:text-slate-200'),
    (r'(?<!dark:)text-brand-navy(?!\s+dark:text-)', 'text-brand-navy dark:text-white'),
    (r'(?<!dark:)text-slate-800(?!\s+dark:text-)', 'text-slate-800 dark:text-slate-200'),
    (r'(?<!dark:)text-gray-500(?!\s+dark:text-)', 'text-gray-500 dark:text-slate-400'),
    (r'(?<!dark:)text-gray-600(?!\s+dark:text-)', 'text-gray-600 dark:text-slate-400'),
    (r'(?<!dark:)border-gray-200(?!\s+dark:border-)', 'border-gray-200 dark:border-slate-800'),
    (r'(?<!dark:)border-gray-100(?!\s+dark:border-)', 'border-gray-100 dark:border-slate-800'),
    (r'(?<!dark:)border-slate-200(?!\s+dark:border-)', 'border-slate-200 dark:border-slate-800'),
    (r'(?<!dark:)bg-slate-100(?!\s+dark:bg-)', 'bg-slate-100 dark:bg-slate-800'),
    (r'(?<!dark:)bg-gray-100(?!\s+dark:bg-)', 'bg-gray-100 dark:bg-slate-800'),
    (r'(?<!dark:)border-brand-cobalt/20(?!\s+dark:border-)', 'border-brand-cobalt/20 dark:border-blue-500/20'),
]

files_to_process = [
    "src/App.tsx",
    "src/components/StudyMaterialPage.tsx",
    "src/components/SeniorsOpinionPage.tsx",
    "src/components/VirtualTestMode.tsx",
    "src/components/Dashboard.tsx",
    "src/components/Pricing.tsx"
]

for file_path in files_to_process:
    if not os.path.exists(file_path):
        continue
        
    with open(file_path, "r") as f:
        content = f.read()
        
    original = content
    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content)
        
    if content != original:
        with open(file_path, "w") as f:
            f.write(content)
        print(f"Updated {file_path}")
    else:
        print(f"No changes for {file_path}")
