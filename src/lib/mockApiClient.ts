// Client-side mock API responses (replaces /api/invoke/[toolName])
const mockResponses: Record<string, any> = {
  'linkedin-profile': {
    success: true,
    data: {
      name: 'Demo User',
      title: 'Software Engineer',
      experience: [
        {
          company: 'Tech Corp',
          title: 'Senior Developer',
          duration: '2 years',
        },
      ],
      skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
    },
  },
  'job-search': {
    success: true,
    data: {
      jobs: [
        {
          id: '1',
          title: 'Senior Developer',
          company: 'Tech Corp',
          location: 'Riyadh',
          salaryRange: '15,000 - 20,000 SAR',
          matchScore: 85,
          fitCategory: 'excellent',
        },
        {
          id: '2',
          title: 'Full Stack Engineer',
          company: 'Innovation Labs',
          location: 'Jeddah',
          salaryRange: '18,000 - 23,000 SAR',
          matchScore: 78,
          fitCategory: 'good',
        },
      ],
    },
  },
  'career-growth': {
    success: true,
    data: {
      currentLevel: 'Mid-level',
      targetLevel: 'Senior',
      progress: 65,
      skillsGap: ['System Design', 'Leadership', 'Architecture'],
    },
  },
  'learning-path': {
    success: true,
    data: {
      courses: [
        {
          id: '1',
          title: 'Advanced React Patterns',
          provider: 'Coursera',
          duration: '4 weeks',
          relevance: 'high',
        },
        {
          id: '2',
          title: 'System Design Fundamentals',
          provider: 'Udemy',
          duration: '6 weeks',
          relevance: 'high',
        },
      ],
    },
  },
  'get_candidate': {
    success: true,
    data: {},
  },
  'get_job_applicants': {
    success: true,
    data: {
      applications: [],
    },
  },
  'list_job_postings_by_poster': {
    success: true,
    data: {
      postings: [],
    },
  },
  'list_job_postings': {
    success: true,
    data: {
      postings: [],
    },
  },
  'get_jobs_by_skills': {
    success: true,
    data: {
      jobs: [],
    },
  },
  'get_skill_progression': {
    success: true,
    data: {
      skills: [],
    },
  },
  'get_career_growth': {
    success: true,
    data: {
      currentLevel: 'Mid-level',
      progress: 65,
    },
  },
  'get_market_relevance': {
    success: true,
    data: {
      relevance: 75,
    },
  },
};

/**
 * Client-side mock API that simulates fetch calls to /api/invoke/[toolName]
 * This allows the app to work with static export (no server-side API routes)
 */
export async function mockApiInvoke(toolName: string, body?: any): Promise<Response> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));

  console.log(`[MockAPI] Tool invoked: ${toolName}`, body);

  // Return mock response if available
  const mockResponse = mockResponses[toolName];
  if (mockResponse) {
    return new Response(JSON.stringify(mockResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Default success response for unknown tools
  return new Response(
    JSON.stringify({
      success: true,
      data: { message: `Tool ${toolName} executed successfully` },
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Intercepts fetch calls to /api/invoke/* and redirects to mock API
 */
export function setupMockApiInterceptor() {
  if (typeof window === 'undefined') return;

  const originalFetch = window.fetch;
  
  window.fetch = async function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    
    // Intercept /api/invoke calls
    if (url.includes('/api/invoke/')) {
      const toolName = url.split('/api/invoke/')[1].split('?')[0];
      const body = init?.body ? JSON.parse(init.body as string) : undefined;
      return mockApiInvoke(toolName, body);
    }
    
    // Pass through all other requests
    return originalFetch(input, init);
  };
  
  console.log('[MockAPI] Interceptor installed for /api/invoke/* routes');
}
