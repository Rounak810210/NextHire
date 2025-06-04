from app import db, Roadmap, MCQ
from datetime import datetime

def add_initial_data():
    # Software Engineer Roadmap
    software_engineer_roadmap = Roadmap(
        role="software-engineer",
        title="Software Engineering Career Path",
        description="A comprehensive roadmap for becoming a proficient software engineer",
        topics={
            "fundamentals": {
                "title": "Programming Fundamentals",
                "items": [
                    "Data Structures and Algorithms",
                    "Object-Oriented Programming",
                    "Design Patterns",
                    "Clean Code Principles"
                ]
            },
            "web_development": {
                "title": "Web Development",
                "items": [
                    "HTML, CSS, JavaScript",
                    "Frontend Frameworks (React, Vue, Angular)",
                    "Backend Development (Node.js, Python, Java)",
                    "RESTful APIs and GraphQL"
                ]
            },
            "databases": {
                "title": "Database Systems",
                "items": [
                    "SQL and Relational Databases",
                    "NoSQL Databases",
                    "Database Design",
                    "Query Optimization"
                ]
            },
            "system_design": {
                "title": "System Design",
                "items": [
                    "Scalability and Performance",
                    "Microservices Architecture",
                    "Cloud Computing",
                    "Security Best Practices"
                ]
            }
        },
        resources={
            "books": [
                "Clean Code by Robert C. Martin",
                "Design Patterns by Gang of Four",
                "System Design Interview by Alex Xu"
            ],
            "online_courses": [
                "Coursera - Software Engineering Specialization",
                "Udemy - Web Development Bootcamp",
                "MIT OpenCourseWare - Introduction to Algorithms"
            ],
            "practice_platforms": [
                "LeetCode",
                "HackerRank",
                "System Design Primer"
            ]
        }
    )

    # Sample MCQs for Software Engineering
    mcqs = [
        # Data Structures MCQs
        MCQ(
            role="software-engineer",
            topic="Data Structures",
            question="What is the time complexity of searching in a balanced binary search tree?",
            options={
                "A": "O(1)",
                "B": "O(log n)",
                "C": "O(n)",
                "D": "O(n²)"
            },
            correct_answer="B",
            explanation="In a balanced binary search tree, each comparison eliminates half of the remaining nodes, resulting in a logarithmic time complexity of O(log n).",
            difficulty="medium"
        ),
        MCQ(
            role="software-engineer",
            topic="Data Structures",
            question="Which data structure would be most efficient for implementing a cache with a fixed size and LRU (Least Recently Used) eviction policy?",
            options={
                "A": "Array",
                "B": "Linked List",
                "C": "Hash Map with Doubly Linked List",
                "D": "Binary Search Tree"
            },
            correct_answer="C",
            explanation="A Hash Map with Doubly Linked List provides O(1) access time and allows efficient removal/addition of elements for LRU implementation.",
            difficulty="hard"
        ),
        
        # OOP MCQs
        MCQ(
            role="software-engineer",
            topic="OOP",
            question="Which of the following best describes encapsulation in OOP?",
            options={
                "A": "Breaking down complex problems into smaller parts",
                "B": "Hiding internal details and providing an interface",
                "C": "Creating multiple instances of a class",
                "D": "Inheriting properties from parent class"
            },
            correct_answer="B",
            explanation="Encapsulation is the bundling of data and methods that operate on that data within a single unit, hiding the internal details.",
            difficulty="easy"
        ),
        MCQ(
            role="software-engineer",
            topic="OOP",
            question="What is the main advantage of using interfaces in OOP?",
            options={
                "A": "They allow multiple inheritance",
                "B": "They improve code performance",
                "C": "They enforce a contract for implementing classes",
                "D": "They reduce memory usage"
            },
            correct_answer="C",
            explanation="Interfaces define a contract that implementing classes must follow, promoting loose coupling and standardization.",
            difficulty="medium"
        ),

        # System Design MCQs
        MCQ(
            role="software-engineer",
            topic="System Design",
            question="Which of the following is NOT a benefit of microservices architecture?",
            options={
                "A": "Independent scaling",
                "B": "Technology stack flexibility",
                "C": "Simplified debugging",
                "D": "Easy deployment"
            },
            correct_answer="C",
            explanation="Microservices actually make debugging more complex due to distributed nature and multiple service interactions.",
            difficulty="hard"
        ),
        MCQ(
            role="software-engineer",
            topic="System Design",
            question="What is the primary purpose of a load balancer?",
            options={
                "A": "To increase storage capacity",
                "B": "To distribute incoming traffic across multiple servers",
                "C": "To encrypt data transmission",
                "D": "To cache frequently accessed data"
            },
            correct_answer="B",
            explanation="Load balancers distribute incoming network traffic across multiple servers to ensure no single server bears too much load.",
            difficulty="medium"
        ),

        # Web Development MCQs
        MCQ(
            role="software-engineer",
            topic="Web Development",
            question="What is the purpose of CORS (Cross-Origin Resource Sharing)?",
            options={
                "A": "To compress HTTP responses",
                "B": "To enable secure cross-origin requests",
                "C": "To cache API responses",
                "D": "To validate form inputs"
            },
            correct_answer="B",
            explanation="CORS is a security feature that allows or restricts requested resources on a web page from another domain outside the domain from which the resource originated.",
            difficulty="medium"
        ),
        MCQ(
            role="software-engineer",
            topic="Web Development",
            question="Which HTTP method should be used for idempotent operations that update a resource?",
            options={
                "A": "POST",
                "B": "PUT",
                "C": "PATCH",
                "D": "DELETE"
            },
            correct_answer="B",
            explanation="PUT is idempotent and should be used when updating a resource where the client sends the complete updated resource.",
            difficulty="medium"
        ),

        # Database MCQs
        MCQ(
            role="software-engineer",
            topic="Databases",
            question="What is the main purpose of database normalization?",
            options={
                "A": "To improve query performance",
                "B": "To reduce data redundancy",
                "C": "To increase storage capacity",
                "D": "To simplify database backups"
            },
            correct_answer="B",
            explanation="Database normalization is primarily used to reduce data redundancy and improve data integrity by organizing data efficiently.",
            difficulty="medium"
        ),
        MCQ(
            role="software-engineer",
            topic="Databases",
            question="Which type of index would be most efficient for range queries?",
            options={
                "A": "Hash Index",
                "B": "B-tree Index",
                "C": "Bitmap Index",
                "D": "Full-text Index"
            },
            correct_answer="B",
            explanation="B-tree indexes are efficient for range queries as they maintain sorted order and allow for efficient range scans.",
            difficulty="hard"
        ),

        # Clean Code MCQs
        MCQ(
            role="software-engineer",
            topic="Clean Code",
            question="What is the primary characteristic of a pure function?",
            options={
                "A": "It uses global variables",
                "B": "It has side effects",
                "C": "It returns the same output for the same input",
                "D": "It modifies its parameters"
            },
            correct_answer="C",
            explanation="A pure function always returns the same output for the same input and has no side effects.",
            difficulty="medium"
        ),
        MCQ(
            role="software-engineer",
            topic="Clean Code",
            question="Which of the following is a code smell?",
            options={
                "A": "Short methods",
                "B": "Immutable objects",
                "C": "Duplicate code",
                "D": "Interface segregation"
            },
            correct_answer="C",
            explanation="Duplicate code is a code smell as it violates the DRY (Don't Repeat Yourself) principle and makes maintenance difficult.",
            difficulty="easy"
        )
    ]

    try:
        # Add roadmap
        db.session.add(software_engineer_roadmap)
        
        # Add MCQs
        for mcq in mcqs:
            db.session.add(mcq)
            
        db.session.commit()
        print("Initial data added successfully!")
        
    except Exception as e:
        db.session.rollback()
        print(f"Error adding initial data: {str(e)}")

if __name__ == "__main__":
    add_initial_data() 