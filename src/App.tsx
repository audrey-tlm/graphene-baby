import {
  AppLayout,
  AppSidebar,
  ContentHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  ThemeProvider,
} from '@gravitee/graphene-core';
import {
  ArchiveIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  ListIcon,
  SettingsIcon,
  SlidersHorizontalIcon,
  Trash2Icon,
  Wand2Icon,
  WorkflowIcon,
} from '@gravitee/graphene-core/icons';
import { useMemo, useState } from 'react';

import { HelpContentProvider, HelpContentToggle } from './components/help';
import { SIDEBAR_NAV_ACTIVE_CLASS } from './components/sidebarNav';
import { ThemeModeToggle } from './components/ThemeModeToggle';
import { ThemeSettingsPanel } from './components/ThemeSettingsPanel';
import { AddItemWizardPage } from './examples/AddItemWizardPage';
import { ConfigPanelPage } from './examples/ConfigPanelPage';
import { DashboardPage } from './examples/DashboardPage';
import { DeleteModalPage } from './examples/DeleteModalPage';
import { DetailPage } from './examples/DetailPage';
import { EmptyStatePage } from './examples/EmptyStatePage';
import { ListPage } from './examples/ListPage';
import { PolicyStudioPage } from './examples/PolicyStudioPage';
import { SettingsFormPage } from './examples/SettingsFormPage';
import { GuardrailFactsProvider } from './rules/runtimeFacts';
import { ThemeConfigProvider } from './theme/ThemeConfigContext';

const PAGES = [
  { key: 'dashboard', title: 'Dashboard', icon: LayoutDashboardIcon, Component: DashboardPage },
  { key: 'list', title: 'Projects (list)', icon: ListIcon, Component: ListPage },
  { key: 'detail', title: 'Project (detail)', icon: FileTextIcon, Component: DetailPage },
  { key: 'policy-studio', title: 'Policy Studio', icon: WorkflowIcon, Component: PolicyStudioPage },
  { key: 'form', title: 'Settings (form)', icon: SettingsIcon, Component: SettingsFormPage },
  { key: 'empty', title: 'Integrations (empty)', icon: ArchiveIcon, Component: EmptyStatePage },
  { key: 'delete-modal', title: 'Webhooks (delete modal)', icon: Trash2Icon, Component: DeleteModalPage },
  { key: 'config-panel', title: 'Connectors (side panel)', icon: SlidersHorizontalIcon, Component: ConfigPanelPage },
  { key: 'add-wizard', title: 'Data source (wizard)', icon: Wand2Icon, Component: AddItemWizardPage },
] as const;

function ExampleNavigation({ activeKey, onSelect }: { activeKey: string; onSelect: (key: string) => void }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Example pages</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {PAGES.map((page) => (
            <SidebarMenuItem key={page.key}>
              <SidebarMenuButton
                isActive={page.key === activeKey}
                className={SIDEBAR_NAV_ACTIVE_CLASS}
                onClick={() => onSelect(page.key)}
              >
                <page.icon aria-hidden="true" />
                <span>{page.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function App() {
  const [activeKey, setActiveKey] = useState<string>(PAGES[0].key);
  const activePage = useMemo(() => PAGES.find((p) => p.key === activeKey) ?? PAGES[0], [activeKey]);
  const ActiveComponent = activePage.Component;

  return (
    <ThemeProvider>
      <ThemeConfigProvider>
        <HelpContentProvider>
          <GuardrailFactsProvider key={activeKey}>
            <AppLayout
              sidebar={
                <AppSidebar renderNavigation={() => <ExampleNavigation activeKey={activeKey} onSelect={setActiveKey} />} />
              }
              subheader={
                <ContentHeader
                  breadcrumbs={[{ label: 'Gamma theming playground' }, { label: activePage.title }]}
                  trailing={
                    <div className="flex items-center gap-2">
                      <HelpContentToggle />
                      <ThemeModeToggle />
                      <ThemeSettingsPanel />
                    </div>
                  }
                />
              }
            >
              <ActiveComponent />
            </AppLayout>
          </GuardrailFactsProvider>
        </HelpContentProvider>
      </ThemeConfigProvider>
    </ThemeProvider>
  );
}
