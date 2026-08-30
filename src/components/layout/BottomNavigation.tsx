import React from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { HomeIcon, CreateIcon, LibraryIcon, ProfileIcon } from '../../assets/icons/Icons';

export const BottomNavigation: React.FC = () => {
  const { activeTab, setActiveTab, currentScreen } = useNavigation();

  // Only show bottom navigation on main navigation hub screens
  const showNavScreens = ['home', 'library', 'profile', 'creator_overview', 'empty_states_demo'];
  if (!showNavScreens.includes(currentScreen)) {
    return null;
  }

  return (
    <nav className="bottom-nav" aria-label="Bottom Navigation">
      <div
        className={`nav-item ${activeTab === 'home' && currentScreen === 'home' ? 'active' : ''}`}
        onClick={() => setActiveTab('home')}
      >
        <HomeIcon size={22} strokeWidth={activeTab === 'home' && currentScreen === 'home' ? 2.3 : 1.8} />
        <span className="nav-item-label">Home</span>
      </div>

      <div
        className="nav-item"
        onClick={() => setActiveTab('create')}
      >
        <div className="nav-item-create-btn">
          <CreateIcon size={22} strokeWidth={2.4} />
        </div>
        <span className="nav-item-label" style={{ marginTop: 2 }}>Create</span>
      </div>

      <div
        className={`nav-item ${activeTab === 'library' || currentScreen === 'library' ? 'active' : ''}`}
        onClick={() => setActiveTab('library')}
      >
        <LibraryIcon size={22} strokeWidth={activeTab === 'library' ? 2.3 : 1.8} />
        <span className="nav-item-label">Library</span>
      </div>

      <div
        className={`nav-item ${activeTab === 'profile' || currentScreen === 'profile' ? 'active' : ''}`}
        onClick={() => setActiveTab('profile')}
      >
        <ProfileIcon size={22} strokeWidth={activeTab === 'profile' ? 2.3 : 1.8} />
        <span className="nav-item-label">Profile</span>
      </div>
    </nav>
  );
};
