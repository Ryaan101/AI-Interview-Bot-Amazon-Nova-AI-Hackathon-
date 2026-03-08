# Reflection Report

## Activity Description

For this extracurricular assignment, I participated in the Amazon Nova AI Hackathon and worked on developing a project called **InterviewAI**, an AI-powered mock interview platform. The goal of the event was to design and build a software project that uses Amazon Nova AI technologies. My team decided to create a tool that helps students and job seekers practice interviews in a realistic but low-pressure environment.

The application allows users to start an interview session, answer questions, and receive follow-up prompts from an AI interviewer. This simulates a real interview conversation and helps users practice communicating their ideas clearly. During the event, I worked with my team to help develop and test the system, debug issues, and understand how the different parts of the application interact.

## Technical Decisions

One of the main technical decisions was separating the project into a frontend and backend architecture. The frontend handles the user interface where the user interacts with the interviewer, while the backend processes responses, manages interview sessions, and communicates with the AI model.

Another important decision was implementing session management so the interview could maintain conversation history. Without session tracking, each user response would be treated independently and the interview would not feel like a continuous conversation. By storing the session state the AI can generate more natural follow-up questions.

We also needed to configure environment variables and API access to connect the backend to the AI services securely. Managing this configuration properly was important to ensure the system worked consistently across different development environments.

## Contributions

This project was completed as part of a team during the hackathon. My contributions included creating the instructions and prompts that the AI would follow during an interview session. These prompts were important because they defined the behavior of the AI interviewer, including how it asks questions, responds to user answers, and continues the conversation in a realistic way.

I was also responsible for helping develop the backend portion of the application. The backend manages interview sessions, processes user responses, and communicates with the AI model to generate follow-up questions. This required structuring the API endpoints, organizing how session data and conversation history were stored, and ensuring that the AI responses were correctly returned to the frontend.

In addition, I explored ideas for improving the project, such as adding voice-based interview interaction so that the experience could feel more like a real interview conversation.

## Quality Assessment

Overall, I believe my participation in this event was valuable because I was actively involved in both the development and debugging process. I learned more about how full-stack applications work, how conversational AI can be integrated into software systems, and how to collaborate with others in a hackathon.

If I were to redo the event, I would focus on setting up the development environment and testing integrations earlier in the process. This would allow more time to improve the user experience and add additional features.