/**
 * Journey-welcome-tellmore — Tell me more about TrAIn
 * Step ID: 3847-B | Tool ID: 2194-B
 */
export default function journeyWelcomeTellmore() {
  return {
    success: true,
    badge: 'MOBEUS CAREER',
    title: 'Welcome',
    subtitle: 'About TrAIn',
    generativeSubsections: [
      {
        id: 'welcome-tellmore',
        templateId: 'GlassmorphicOptions',
        props: {
          bubbles: [
            { label: 'How does TrAIn work?' },
            { label: 'How is TrAIn different?' },
            { label: 'Can I build skills on TrAIn?' },
            { label: 'Which jobs can I find on TrAIn?' },
            { label: 'How does TrAIn use my data?' },
            { label: 'Something else' },
          ],
        },
      },
    ],
  };
}
