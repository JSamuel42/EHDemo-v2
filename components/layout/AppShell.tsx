import TopBar from './TopBar';
import Sidebar from './Sidebar';
import MainArea from './MainArea';
import { SidebarProvider } from './SidebarContext';
import { ActiveAssetProvider } from './ActiveAssetContext';
import { ChatPanelProvider } from '@/components/chat/ChatPanelContext';
import ChatPanelHost from '@/components/chat/ChatPanelHost';
import { LibraryStoreProvider } from '@/lib/library/istent-store';
import { AdminModeProvider } from '@/lib/admin/AdminModeContext';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ActiveAssetProvider>
      <SidebarProvider>
        {/* LibraryStore + AdminMode back the iStent Library's in-session edit
            overlay and admin toggle. They wrap the whole app so the Library
            route can consume them; the Alnyx path never reads them. */}
        <LibraryStoreProvider>
          <AdminModeProvider>
            <ChatPanelProvider initialOpen={false}>
              <div className="min-h-screen bg-serif-background">
                <TopBar />
                <Sidebar />
                <MainArea>{children}</MainArea>
                <ChatPanelHost />
              </div>
            </ChatPanelProvider>
          </AdminModeProvider>
        </LibraryStoreProvider>
      </SidebarProvider>
    </ActiveAssetProvider>
  );
}
