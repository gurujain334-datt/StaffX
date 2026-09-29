import { Router, Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';

export const aiRouter = Router();

// Initialize GenAI client lazily or when API key is present
function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * 1. Generate Staffing Plan
 */
aiRouter.post('/generate-staffing-plan', async (req: Request, res: Response) => {
  try {
    const ai = getGenAIClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key not configured',
        fallback: true,
      });
    }

    const { eventName, description, guestCount, location, eventType, shiftStart, shiftEnd } = req.body;

    const prompt = `
You are an expert event operations and staffing director.
Analyze the following event details and generate a recommended staffing plan with required workforce roles, headcount, skills, responsibilities, and fair shift daily wages in Indian Rupees (₹).

Event Name: ${eventName || 'Event'}
Type: ${eventType || 'General Event'}
Guest Count: ${guestCount || 300}
Location: ${location || 'Bhopal, MP'}
Shift Hours: ${shiftStart || '17:00'} to ${shiftEnd || '23:00'}
Additional Description: ${description || 'No additional notes provided.'}

Provide a structured staffing plan with appropriate roles (e.g. Security Guard, Waiter, Usher, Event Coordinator, Registration Desk Agent, Cleaner, Bartender) tailored for this scale.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an event staffing strategist. Return only valid structured JSON conforming to the requested schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            roles: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  role: { type: Type.STRING, description: 'Role title, e.g. Security Guard' },
                  workers_required: { type: Type.INTEGER, description: 'Recommended number of workers' },
                  skills: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '3-4 required skills for this role',
                  },
                  responsibilities: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '2-3 key duties on site',
                  },
                  suggested_payment: { type: Type.INTEGER, description: 'Suggested daily pay in INR (e.g. 1500)' },
                  shift_start: { type: Type.STRING, description: 'Start time e.g. 17:00' },
                  shift_end: { type: Type.STRING, description: 'End time e.g. 23:00' },
                  notes: { type: Type.STRING, description: 'Special advice or location placement' },
                },
                required: ['role', 'workers_required', 'skills', 'responsibilities', 'suggested_payment'],
              },
            },
          },
          required: ['roles'],
        },
      },
    });

    const text = response.text?.trim() || '{}';
    const parsed = JSON.parse(text);
    return res.json({ success: true, plan: parsed.roles || [] });
  } catch (error: any) {
    console.error('Error generating staffing plan:', error?.message || error);
    return res.status(500).json({ error: 'Failed to generate staffing plan', details: error?.message });
  }
});

/**
 * 2. Match Candidates for a Requirement
 */
aiRouter.post('/match-candidates', async (req: Request, res: Response) => {
  try {
    const ai = getGenAIClient();
    if (!ai) {
      return res.status(503).json({ error: 'Gemini API key not configured', fallback: true });
    }

    const { requirement, candidates, eventLocation } = req.body;

    const prompt = `
Analyze the candidate profiles for the following staffing requirement and calculate match compatibility scores.

Staffing Requirement:
Role: ${requirement.role}
Required Skills: ${JSON.stringify(requirement.requiredSkills || [])}
Event Location: ${eventLocation || 'Bhopal'}
Pay: ₹${requirement.payAmount}
Description: ${requirement.description || ''}

Candidates List:
${JSON.stringify(
  (candidates || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    skills: c.skills,
    experienceYears: c.experienceYears,
    location: c.location,
    availability: c.availability,
    rating: c.rating,
    verificationStatus: c.verificationStatus,
    completedJobsCount: c.completedJobsCount,
  })),
  null,
  2
)}

For each candidate, calculate an AI Match Score (0-100), boolean breakdown for skills, experience, location, availability, and rating, plus a clear 1-2 sentence explanation.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matches: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  professionalId: { type: Type.STRING },
                  matchScore: { type: Type.INTEGER, description: 'Percentage score 40-99' },
                  breakdown: {
                    type: Type.OBJECT,
                    properties: {
                      skillMatch: { type: Type.BOOLEAN },
                      locationMatch: { type: Type.BOOLEAN },
                      availabilityMatch: { type: Type.BOOLEAN },
                      experienceMatch: { type: Type.BOOLEAN },
                      ratingMatch: { type: Type.BOOLEAN },
                    },
                  },
                  explanation: { type: Type.STRING, description: 'Clear explanation of why this candidate is a good match' },
                },
                required: ['professionalId', 'matchScore', 'explanation'],
              },
            },
          },
          required: ['matches'],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json({ success: true, matches: parsed.matches || [] });
  } catch (error: any) {
    console.error('Error matching candidates:', error?.message || error);
    return res.status(500).json({ error: 'Failed to match candidates', details: error?.message });
  }
});

/**
 * 3. Rank Applications for Organizer
 */
aiRouter.post('/rank-applications', async (req: Request, res: Response) => {
  try {
    const ai = getGenAIClient();
    if (!ai) {
      return res.status(503).json({ error: 'Gemini API key not configured', fallback: true });
    }

    const { requirement, applications } = req.body;

    const prompt = `
You are an expert HR and staffing AI evaluator. Rank these job applications for the following staffing position.

Requirement Role: ${requirement.role}
Required Skills: ${JSON.stringify(requirement.requiredSkills || [])}

Applications:
${JSON.stringify(
  (applications || []).map((a: any) => ({
    applicationId: a.id,
    candidateName: a.professionalName,
    rating: a.professionalRating,
    experienceYears: a.professionalExperience,
    verified: a.professionalVerified,
    coverNote: a.message,
  })),
  null,
  2
)}

Return a ranked order with score (40-99), key reasons array, and concise explanation.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rankings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  applicationId: { type: Type.STRING },
                  matchScore: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                  keyReasons: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['applicationId', 'matchScore', 'explanation', 'keyReasons'],
              },
            },
          },
          required: ['rankings'],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json({ success: true, rankings: parsed.rankings || [] });
  } catch (error: any) {
    console.error('Error ranking applications:', error?.message || error);
    return res.status(500).json({ error: 'Failed to rank applications', details: error?.message });
  }
});

/**
 * 4. Generate AI Job Recommendations for a Professional
 */
aiRouter.post('/recommend-jobs', async (req: Request, res: Response) => {
  try {
    const ai = getGenAIClient();
    if (!ai) {
      return res.status(503).json({ error: 'Gemini API key not configured', fallback: true });
    }

    const { professional, jobs } = req.body;

    const prompt = `
Evaluate open event jobs for the following candidate profile and recommend top matching gigs.

Professional Profile:
Name: ${professional.name}
Primary Skills: ${JSON.stringify(professional.skills || [])}
Category: ${professional.primaryCategory}
Location: ${professional.location}
Experience: ${professional.experienceYears} years
Availability: ${professional.availability}
Rating: ${professional.rating}

Open Jobs:
${JSON.stringify(
  (jobs || []).map((j: any) => ({
    requirementId: j.req.id,
    role: j.req.role,
    payAmount: j.req.payAmount,
    requiredSkills: j.req.requiredSkills,
    eventName: j.event.name,
    eventLocation: j.event.location,
    startDate: j.event.startDate,
  })),
  null,
  2
)}

Recommend jobs with match score and 1-sentence reason.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  requirementId: { type: Type.STRING },
                  matchScore: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                },
                required: ['requirementId', 'matchScore', 'explanation'],
              },
            },
          },
          required: ['recommendations'],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json({ success: true, recommendations: parsed.recommendations || [] });
  } catch (error: any) {
    console.error('Error recommending jobs:', error?.message || error);
    return res.status(500).json({ error: 'Failed to recommend jobs', details: error?.message });
  }
});

/**
 * 5. Generate Professional Profile Bio & Skill Extraction
 */
aiRouter.post('/generate-bio', async (req: Request, res: Response) => {
  try {
    const ai = getGenAIClient();
    if (!ai) {
      return res.status(503).json({ error: 'Gemini API key not configured', fallback: true });
    }

    const { experienceText, currentRole } = req.body;

    const prompt = `
Transform the following raw experience notes from an event industry worker into a polished professional bio, extracted skill keywords, and structured experience summary.

Role/Category: ${currentRole || 'Event Professional'}
Raw Input: "${experienceText}"

Return JSON with bio, suggestedSkills array, and summary.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bio: { type: Type.STRING, description: 'Polished 2-3 sentence professional bio' },
            suggestedSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Extracted key skill tags e.g. Crowd Control, Customer Service',
            },
            summary: { type: Type.STRING, description: '1-line high level overview' },
          },
          required: ['bio', 'suggestedSkills', 'summary'],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json({ success: true, bio: parsed.bio, suggestedSkills: parsed.suggestedSkills, summary: parsed.summary });
  } catch (error: any) {
    console.error('Error generating bio:', error?.message || error);
    return res.status(500).json({ error: 'Failed to generate bio', details: error?.message });
  }
});

/**
 * 7. Multi-turn AI Assistant Chat
 */
aiRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const ai = getGenAIClient();
    if (!ai) {
      return res.status(503).json({ error: 'Gemini API key not configured', fallback: true });
    }

    const { message, history, context } = req.body;

    // Convert frontend history format to Gemini format
    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const systemInstruction = `You are the Official StaffX AI Specialist & Operations Expert. 
    You are chatting with ${context?.user || 'a user'} who is logged in as a ${context?.role || 'Guest'}.

    Provide highly informative, concise, and structured answers grounded strictly in the following StaffX Platform Knowledge Base:

    === STAFFX PLATFORM CORE KNOWLEDGE BASE ===
    1. WHAT IS STAFFX?
       - StaffX is a Next-Generation Event Workforce & Staffing Platform. It completely automates event staffing by providing pre-verified professionals, algorithmic matching, rotating secure QR check-ins, and zero-dispute daily escrow payouts.
       - Driven by the proprietary "StaffX 2026 Engine" for high-precision event matching.

    2. WORKFLOWS FOR EVENT ORGANIZERS:
       - **Event Creation**: Organizers can create events, specify custom shift requirements, define payment rates (in INR ₹), and set timings.
       - **AI Staffing Planner**: Organizers can input their event description and guest count, and the AI will auto-generate an operational plan listing needed roles, recommended headcounts, responsibilities, and fair pay guidelines.
       - **Algorithmic Match Scoring**: View candidate match fit scores (e.g., 96% fit) reflecting skills, experience, verified credentials, and local proximity.
       - **KYC & Vetting Governance**: Only hire workers who have been thoroughly checked. Organizers can use AI to rank job applications instantly.
       - **Kyber-Secure QR Check-in**: Stream live attendance on-site. Organizers generate a shift QR code, and workers scan it to register on-time check-in and checkout.
       - **Zero-Dispute Escrows**: Shift pay is deposited into a digital escrow contract upon event launch and disbursed automatically to the worker's wallet upon checkout.

    3. WORKFLOWS FOR WORKFORCE PROFESSIONALS (CREW/STAFF):
       - **Onboarding & KYC**: Professionals complete identity verification to earn a green "Verified Badge" which boosts match scores.
       - **AI Profile Optimization**: Extract key skills and auto-generate clean resumes/bios using AI text analysis.
       - **Dynamic Gig Feed**: Single-click apply to matching gig shifts in their local area.
       - **Real-Time Wallet & Earnings**: Track hours logged, completed shifts, average star ratings, and review daily wallet balances.
       - **QR Check-In Pass**: Access a secure rotating attendance check-in token on the "Attendance" portal.

    4. PLATFORM ROLES & FAIR WAGE ESTIMATES:
       - Senior Event Coordinator / Lead: ₹2,500 - ₹4,000 / day
       - Security Supervisor / Marshal: ₹1,500 - ₹2,500 / day (requires green badge)
       - Guest Relations / Desk Agent: ₹1,200 - ₹1,800 / day
       - AV Support / Tech Specialist: ₹1,500 - ₹3,000 / day
       - Food & Beverage Waitstaff: ₹1,000 - ₹1,500 / day
       - Setup, Logistics & Clean Crew: ₹1,000 - ₹1,300 / day

    5. PLATFORM PORTALS & NAVIGATION:
       - Guide the user to the "Sign In" or "Get Started" buttons in the top navbar if they are currently a Guest.
       - Organizers can visit the **Admin Portal** / **Admin Login** or **Organizer Dashboard** to view live shifts.
       - Professionals can visit the **My Assignments** and **Job Feed** tabs to manage their work.

    === RESPONSE STYLE GUIDELINES ===
    - Keep answers highly professional, precise, and polite.
    - Format answers using clean markdown (bold, lists, or headers) to maximize scan readability.
    - Do not make up any policies or credentials. Always emphasize StaffX's automated, escrow-guaranteed, and high-tech verified model.`;

    const chat = ai.chats.create({
      model: 'gemini-3.5-flash',
      config: {
        systemInstruction,
      },
      history: formattedHistory,
    });

    const response = await chat.sendMessage({ message });

    return res.json({ success: true, reply: response.text });
  } catch (error: any) {
    console.error('Error in chat route:', error?.message || error);
    return res.status(500).json({ error: 'Failed to send message', details: error?.message });
  }
});
aiRouter.post('/ask-assistant', async (req: Request, res: Response) => {
  try {
    const ai = getGenAIClient();
    if (!ai) {
      return res.status(503).json({ error: 'Gemini API key not configured', fallback: true });
    }

    const { prompt, context } = req.body;

    const systemPrompt = `
You are the StaffX AI Staffing Assistant.
Answer the organizer's question grounded strictly in the provided event staffing database context.
Be helpful, concise, professional, and practical.

Database Context:
${JSON.stringify(context || {}, null, 2)}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    return res.json({ success: true, answer: response.text });
  } catch (error: any) {
    console.error('Error in staffing assistant:', error?.message || error);
    return res.status(500).json({ error: 'Assistant unavailable', details: error?.message });
  }
});
