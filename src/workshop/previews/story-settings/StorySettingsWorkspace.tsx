import React from 'react';
import { StorySettingsPanel as ReferenceStorySettingsPanel } from '../../../components/story-settings/reference/StorySettingsPanel';
import { StorySettingsPanel as DevelopmentStorySettingsPanel } from '../../../components/story-settings/development/StorySettingsPanel';
import { FeatureWorkspace } from '../../FeatureWorkspace';
import { workshopEntries } from '../../manifest';

export function StorySettingsWorkspace() {
  const entry = workshopEntries.find(e => e.id === 'story-settings')!;

  return (
    <FeatureWorkspace
      entry={entry}
      allowCompare
      renderReference={() => (
        <div className="min-h-screen bg-void py-10 px-4">
          <ReferenceStorySettingsPanel />
        </div>
      )}
      renderDevelopment={() => (
        <div className="min-h-screen bg-void py-10 px-4">
          <DevelopmentStorySettingsPanel />
        </div>
      )}
    />
  );
}

export default StorySettingsWorkspace;
