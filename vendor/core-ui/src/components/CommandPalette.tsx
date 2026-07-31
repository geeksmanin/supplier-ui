import React, { useState, useEffect, useRef } from 'react';

export interface CommandItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  action: () => void;
  shortcut?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  activePath: string;
  onNavigate: (path: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  activePath,
  onNavigate,
}) => {
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Define static & contextual commands
  const getCommands = (): CommandItem[] => {
    const commands: CommandItem[] = [
      // Global commands
      {
        id: 'go-dashboard',
        title: 'Go to Dashboard',
        description: 'Navigate to the applications workspace',
        category: 'Navigation',
        action: () => { onNavigate('/dashboard'); onClose(); }
      },
      {
        id: 'go-enquiries',
        title: 'Go to Sales Enquiries',
        description: 'Manage sales prospect entries',
        category: 'Navigation',
        action: () => { onNavigate('/sales-enquiries'); onClose(); }
      },
      {
        id: 'go-organisations',
        title: 'Go to Organisations',
        description: 'Manage contacts directory',
        category: 'Navigation',
        action: () => { onNavigate('/contacts-organisations'); onClose(); }
      },
      {
        id: 'logout',
        title: 'Sign Out / Logout',
        description: 'Securely end your current session',
        category: 'Session',
        action: () => {
          localStorage.removeItem('token');
          localStorage.removeItem('user_email');
          window.location.reload();
        }
      }
    ];

    // Contextual: Sales Enquiries list
    if (activePath === '/sales-enquiries') {
      commands.push(
        {
          id: 'enq-new',
          title: 'Create New Enquiry',
          description: 'Open a blank enquiry registration form',
          category: 'Sales Enquiries',
          action: () => { onNavigate('/sales-enquiries/new'); onClose(); }
        }
      );
    }

    // Contextual: Enquiry Form Page (new or edit)
    if (activePath.startsWith('/sales-enquiries/') || activePath === '/sales-enquiries/new') {
      commands.push(
        {
          id: 'enq-save',
          title: 'Save Enquiry Form',
          description: 'Save all lines and customer metadata',
          category: 'Form Actions',
          shortcut: 'Ctrl+S',
          action: () => {
            // Dispatch a global event or trigger a Save button click
            const saveBtn = document.querySelector('button[onClick*="handleSubmit"], button:contains("Save")') as HTMLButtonElement;
            if (saveBtn) {
              saveBtn.click();
            } else {
              // Trigger Ctrl+S event manually
              const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true });
              window.dispatchEvent(event);
            }
            onClose();
          }
        },
        {
          id: 'enq-add-row',
          title: 'Add Requested Item Line',
          description: 'Insert a new item line row into the spreadsheet grid',
          category: 'Form Actions',
          action: () => {
            const addRowBtn = document.querySelector('button:contains("Add Row"), button:contains("Add Item")') as HTMLButtonElement;
            if (addRowBtn) {
              addRowBtn.click();
            } else {
              // Dispatch Alt+A
              const event = new KeyboardEvent('keydown', { key: 'a', altKey: true, bubbles: true });
              window.dispatchEvent(event);
            }
            onClose();
          }
        },
        {
          id: 'enq-cancel',
          title: 'Cancel & Return to List',
          description: 'Go back to sales enquiries list without saving',
          category: 'Form Actions',
          shortcut: 'Escape',
          action: () => {
            onNavigate('/sales-enquiries');
            onClose();
          }
        }
      );
    }

    // Contextual: Organisations List
    if (activePath === '/contacts-organisations') {
      commands.push(
        {
          id: 'org-new',
          title: 'Register New Organisation',
          description: 'Open a blank registration form',
          category: 'Organisations',
          action: () => { onNavigate('/contacts-organisations/new'); onClose(); }
        }
      );
    }

    // Contextual: Organisation Form Page
    if (activePath.startsWith('/contacts-organisations/') || activePath === '/contacts-organisations/new') {
      commands.push(
        {
          id: 'org-save',
          title: 'Save Organisation Form',
          description: 'Save all general, addresses, and contact info',
          category: 'Form Actions',
          shortcut: 'Ctrl+S',
          action: () => {
            const saveBtn = document.querySelector('button:contains("Save")') as HTMLButtonElement;
            if (saveBtn) {
              saveBtn.click();
            } else {
              const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true });
              window.dispatchEvent(event);
            }
            onClose();
          }
        },
        {
          id: 'org-cancel',
          title: 'Cancel & Return to List',
          description: 'Go back to organisations list without saving',
          category: 'Form Actions',
          shortcut: 'Escape',
          action: () => {
            onNavigate('/contacts-organisations');
            onClose();
          }
        }
      );
    }

    return commands;
  };

  const filteredCommands = getCommands().filter(cmd => 
    cmd.title.toLowerCase().includes(search.toLowerCase()) ||
    (cmd.description && cmd.description.toLowerCase().includes(search.toLowerCase())) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[activeIndex]) {
          filteredCommands[activeIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeIndex, filteredCommands, onClose]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      justifyContent: 'center',
      paddingTop: '15vh',
      zIndex: 99999,
      fontFamily: 'Inter, system-ui, sans-serif'
    }} onClick={onClose}>
      <div style={{
        width: '540px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: '360px',
      }} onClick={e => e.stopPropagation()}>
        {/* Search header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '1px solid #e2e8f0',
          padding: '12px 16px',
        }}>
          <span style={{ fontSize: '1.2rem', color: '#94a3b8' }}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search action..."
            value={search}
            onChange={e => { setSearch(e.target.value); setActiveIndex(0); }}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '0.95rem',
              color: '#0f172a',
            }}
          />
          <kbd style={{
            fontSize: '0.7rem',
            backgroundColor: '#f1f5f9',
            border: '1px solid #e2e8f0',
            padding: '2px 6px',
            borderRadius: '4px',
            color: '#64748b',
            fontWeight: 500,
          }}>ESC</kbd>
        </div>

        {/* Command list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
          {filteredCommands.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontSize: '0.85rem' }}>
              No commands matching "{search}"
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isActive = idx === activeIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => { cmd.action(); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: isActive ? '#eff6ff' : 'transparent',
                    color: isActive ? '#1e40af' : '#334155',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={() => setActiveIndex(idx)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: isActive ? 600 : 500 }}>
                      {cmd.title}
                    </span>
                    {cmd.description && (
                      <span style={{ fontSize: '0.75rem', color: isActive ? '#3b82f6' : '#64748b' }}>
                        {cmd.description}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: isActive ? '#2563eb' : '#94a3b8',
                      backgroundColor: isActive ? '#dbeafe' : '#f1f5f9',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}>
                      {cmd.category}
                    </span>
                    {cmd.shortcut && (
                      <kbd style={{
                        fontSize: '0.7rem',
                        color: '#64748b',
                        fontWeight: 500,
                      }}>{cmd.shortcut}</kbd>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
