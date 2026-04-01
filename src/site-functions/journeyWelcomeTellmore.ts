import { uiResponse } from './helpers';

/**
 * Journey-welcome-tellmore — Tell me more about TrAIn
 * Step ID: 3847-B | Tool ID: 2194-B
 */
export default function journeyWelcomeTellmore() {
  return uiResponse({
    badge: 'MOBEUS CAREER',
    title: 'Welcome',
    subtitle: 'About TrAIn',
    type: 'GlassmorphicOptions',
    bubbles: [
      { label: 'How does TrAIn work?' },
      { label: 'How is TrAIn different?' },
      { label: 'Can I build skills on TrAIn?' },
      { label: 'Which jobs can I find on TrAIn?' },
      { label: 'How does TrAIn use my data?' },
      { label: 'Something else' },
    ],
  });
}
