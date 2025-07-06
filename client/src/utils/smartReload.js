
// Temporarily disable smart reload to fix loading issues
export const useSmartReload = (type, reloadCallback) => {
  const register = () => {
    console.log(`📝 Smart reload disabled for ${type}`);
  };

  const unregister = () => {
    console.log(`🗑️ Smart reload disabled for ${type}`);
  };

  const reload = (force = false) => {
    console.log(`🔄 Smart reload disabled for ${type}`);
    return Promise.resolve();
  };

  return { register, unregister, reload };
};

export const smartReloadManager = {
  initialize: () => console.log('✅ Smart reload manager disabled'),
  register: () => {},
  unregister: () => {},
  reload: () => Promise.resolve(),
  reloadAll: () => Promise.resolve(),
  cleanup: () => {}
};

export default smartReloadManager;
