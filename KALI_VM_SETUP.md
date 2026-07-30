# Kali Linux VirtualBox VM Setup Guide

This comprehensive guide walks you through creating a **fully customized Kali Linux VirtualBox VM** from scratch. This setup is ideal for penetration testing, security research, and development work.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Step 1: Download Necessary Files](#step-1-download-necessary-files)
- [Step 2: Set Up the Virtual Machine](#step-2-set-up-the-virtual-machine)
- [Step 3: Install Kali Linux](#step-3-install-kali-linux)
- [Step 4: Create a Non-Root User](#step-4-create-a-non-root-user)
- [Step 5: Post-Installation Configuration](#step-5-post-installation-configuration)
- [Step 6: Custom Desktop Environment](#step-6-custom-desktop-environment)
- [Step 7: Networking Configuration](#step-7-networking-configuration)
- [Step 8: Enable Shared Folders](#step-8-enable-shared-folders-optional)
- [Step 9: Persistent Setup](#step-9-persistent-setup)
- [Step 10: Final Optimizations](#step-10-final-optimizations)

---

## Prerequisites

- Host machine with at least 8GB RAM (16GB recommended)
- 50GB+ free disk space
- VT-x/AMD-V hardware virtualization enabled in BIOS
- Internet connection for downloads and updates

---

## Step 1: Download Necessary Files

### 1.1 VirtualBox

Download and install VirtualBox from the official website:
- **Download**: [VirtualBox Official Site](https://www.virtualbox.org/)
- Install the appropriate version for your host OS (Windows, macOS, or Linux)

### 1.2 Kali Linux ISO

1. Visit the [Kali Linux ISO Download Page](https://www.kali.org/get-kali/)
2. Download the **Installer ISO** or **NetInstaller** (recommended for minimal base)
3. Choose the appropriate architecture:
   - **64-bit** (recommended for modern systems)
   - **32-bit** (for older hardware)

**Recommended**: Download the full "Installer" image for offline installation with default tools.

---

## Step 2: Set Up the Virtual Machine

### 2.1 Create New VM

1. Open VirtualBox and click **New**
2. Configure basic settings:
   - **Name**: Kali Linux Custom
   - **Type**: Linux
   - **Version**: Debian 64-bit

### 2.2 Assign System Resources

Configure the following resources based on your host capabilities:

**Memory (RAM)**:
- Minimum: 4 GB (4096 MB)
- Recommended: 8 GB (8192 MB)
- Optimal: 16 GB (16384 MB) for resource-intensive tasks

**Processor**:
- Allocate 2-4 CPU cores
- Enable **PAE/NX** if available
- Verify that **VT-x/AMD-V** is enabled in your BIOS

### 2.3 Create Virtual Hard Disk

1. Select **Create a virtual hard disk now**
2. Choose disk type:
   - **VDI (VirtualBox Disk Image)** - Recommended for VirtualBox-only use
3. Storage allocation:
   - **Dynamically Allocated** - Grows as needed (recommended)
   - **Fixed Size** - Better performance but uses full space immediately
4. **Disk Size**: Allocate at least **50 GB**
   - 50 GB: Minimal installation + some tools
   - 100 GB: Full tool suite with room for projects
   - 200 GB+: Extensive pentesting lab environment

### 2.4 Additional VM Settings

Go to **Settings** and configure:

**System > Motherboard**:
- Boot Order: Optical, Hard Disk
- Extended Features: Enable I/O APIC

**System > Processor**:
- Enable PAE/NX

**Display**:
- Video Memory: 128 MB
- Graphics Controller: VMSVGA or VBoxVGA
- Enable 3D Acceleration (optional)

---

## Step 3: Install Kali Linux

### 3.1 Attach ISO

1. Go to **Settings > Storage**
2. Click the **Empty** CD/DVD drive under Controller: IDE
3. Click the disk icon and select **Choose a disk file**
4. Browse and select your downloaded Kali Linux ISO

### 3.2 Boot and Install

1. Start the VM
2. Select **Graphical Install** from the boot menu
3. Follow the installation wizard:
   
   **Language & Location**:
   - Select your preferred language
   - Choose your location/timezone
   - Configure keyboard layout

   **Network Configuration**:
   - Set hostname (e.g., `kali-custom`)
   - Configure domain (leave blank for local use)

   **Disk Partitioning**:
   - **Guided - use entire disk** (recommended for beginners)
   - **Manual** (for advanced users who want custom partitions)
   - Select the virtual disk created earlier
   - Choose **All files in one partition** or custom scheme

   **Network Configuration During Install**:
   - Use **Bridged Adapter** for the VM to interact directly with your local network
   - Or use **NAT** for isolated internet access

---

## Step 4: Create a Non-Root User

During installation, you'll be prompted to create user accounts:

### 4.1 User Setup

1. **Full name**: Your full name or identifier
2. **Username**: `customuser` (or your preferred username)
3. **Password**: Set a strong password

### 4.2 Root Account

- Set a separate **root password** for administrative tasks
- Keep this password secure and different from your user password

**Best Practice**: Use the non-root user for daily tasks and only elevate to root when necessary using `sudo`.

---

## Step 5: Post-Installation Configuration

After the system boots successfully into Kali Linux, perform these essential updates:

### 5.1 Update System

```bash
sudo apt update && sudo apt upgrade -y
```

This updates the package lists and installs the latest versions of all installed packages.

### 5.2 Install Metapackages

Kali offers several metapackages based on your needs:

**Default Tools** (Recommended starting point):
```bash
sudo apt install kali-linux-default
```

**Large Tool Set** (Extended collection):
```bash
sudo apt install kali-linux-large
```

**Everything** (Complete arsenal - requires significant disk space):
```bash
sudo apt install kali-linux-everything
```

**Specialized Collections**:
```bash
# Web application testing
sudo apt install kali-tools-web

# Wireless testing
sudo apt install kali-tools-wireless

# Forensics
sudo apt install kali-tools-forensics
```

### 5.3 Install Additional Tools

**Oh-My-Zsh** (Enhanced shell with themes and plugins):
```bash
sudo apt install zsh -y
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

**Docker** (Containerization platform):
```bash
sudo apt install docker.io -y
sudo systemctl enable docker --now
sudo usermod -aG docker $USER
```

**Python Development**:
```bash
sudo apt install python3-pip python3-venv -y
```

**Visual Studio Code**:
```bash
sudo apt install code -y
```

**Additional Useful Tools**:
```bash
# Network tools
sudo apt install net-tools nmap wireshark -y

# Text editors
sudo apt install vim neovim -y

# Version control
sudo apt install git -y

# Terminal multiplexer
sudo apt install tmux -y
```

### 5.4 Configure Git

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

## Step 6: Custom Desktop Environment

Choose and install your preferred desktop environment:

### 6.1 Available Desktop Environments

**XFCE** (Default, lightweight):
```bash
sudo apt install kali-desktop-xfce -y
```

**GNOME** (Modern, feature-rich):
```bash
sudo apt install kali-desktop-gnome -y
```

**KDE Plasma** (Highly customizable):
```bash
sudo apt install kali-desktop-kde -y
```

**Other Options**:
```bash
# MATE
sudo apt install kali-desktop-mate -y

# i3 (Tiling window manager)
sudo apt install kali-desktop-i3 -y
```

### 6.2 Customize Appearance

1. **Wallpapers**: Add custom wallpapers to `~/Pictures/Wallpapers`
2. **Themes**: Install themes via appearance settings
3. **Icons**: Browse and install icon packs
4. **Fonts**: Install additional fonts if needed:
   ```bash
   sudo apt install fonts-firacode fonts-hack -y
   ```

---

## Step 7: Networking Configuration

### 7.1 Network Adapter Modes

Configure network adapters based on your use case:

**Bridged Adapter**:
- VM appears as a separate device on your network
- Gets its own IP from your router
- Best for: Network scanning, accessing VM from other devices

**NAT (Network Address Translation)**:
- VM shares host's IP address
- Internet access without exposing VM to network
- Best for: General internet use, isolated testing

**Host-Only Network**:
- VM can only communicate with host
- No internet access
- Best for: Isolated lab environments, malware analysis

### 7.2 Configure Multiple Network Interfaces

1. Shut down the VM
2. Go to **Settings > Network**
3. Enable additional adapters (Adapter 2, 3, 4)
4. Configure each with different modes for flexibility

### 7.3 Test Network Connectivity

```bash
# Test internet connectivity
ping -c 4 8.8.8.8

# Test DNS resolution
ping -c 4 google.com

# Check IP configuration
ip addr show

# View routing table
ip route show
```

### 7.4 Configure Static IP (Optional)

Edit network configuration:
```bash
sudo nano /etc/network/interfaces
```

Add static IP configuration:
```
auto eth0
iface eth0 inet static
    address 192.168.1.100
    netmask 255.255.255.0
    gateway 192.168.1.1
    dns-nameservers 8.8.8.8 8.8.4.4
```

---

## Step 8: Enable Shared Folders (Optional)

Share files easily between host and VM:

### 8.1 Install VirtualBox Guest Additions

```bash
# Install prerequisites
sudo apt install build-essential dkms linux-headers-$(uname -r) -y

# Create mount point
sudo mkdir -p /media/cdrom

# Mount Guest Additions ISO
sudo mount /dev/cdrom /media/cdrom

# Run installer
sudo sh /media/cdrom/VBoxLinuxAdditions.run
```

Alternatively, install from repositories:
```bash
sudo apt install virtualbox-guest-x11 -y
```

### 8.2 Configure Shared Folder

1. In VirtualBox: **Settings > Shared Folders**
2. Click **+** to add new shared folder
3. Select folder path on host
4. Set folder name (e.g., `shared`)
5. Check **Auto-mount** and **Make Permanent**

### 8.3 Access Shared Folder

```bash
# Add user to vboxsf group
sudo usermod -aG vboxsf $USER

# Logout and login, or run:
newgrp vboxsf

# Access shared folder
cd /media/sf_shared
```

---

## Step 9: Persistent Setup

### 9.1 Take Snapshots

Create snapshots at key milestones:

1. **Base Install**: Right after OS installation
2. **Tools Installed**: After installing all tools
3. **Configured**: After all customizations
4. **Clean State**: Before starting any testing

**To take a snapshot**:
- VM Menu: **Machine > Take Snapshot**
- Or use VirtualBox Manager: Right-click VM > Snapshots

### 9.2 Export Appliance

Save your configured VM for reuse:

1. Select the VM in VirtualBox Manager
2. **File > Export Appliance**
3. Choose **OVF 2.0** format
4. Select destination and export

**Benefits**:
- Transfer VM to other machines
- Share configuration with team
- Quick deployment of identical environments

### 9.3 Backup Strategy

```bash
# Backup important configurations
tar -czf ~/kali-backup-$(date +%Y%m%d).tar.gz \
  ~/.bashrc ~/.zshrc ~/.vimrc \
  ~/scripts ~/tools \
  ~/.config
```

---

## Step 10: Final Optimizations

### 10.1 Enable Automatic Updates

```bash
# Install unattended-upgrades
sudo apt install unattended-upgrades -y

# Configure automatic updates
echo 'APT::Periodic::Update-Package-Lists "1";' | sudo tee -a /etc/apt/apt.conf.d/20auto-upgrades
echo 'APT::Periodic::Unattended-Upgrade "1";' | sudo tee -a /etc/apt/apt.conf.d/20auto-upgrades
```

### 10.2 Performance Tuning

**Disable unnecessary services**:
```bash
# List all services
systemctl list-unit-files --type=service

# Disable unwanted services
sudo systemctl disable bluetooth.service
```

**Optimize swap usage**:
```bash
# Reduce swappiness (use less swap)
echo "vm.swappiness=10" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### 10.3 Security Hardening

```bash
# Enable firewall
sudo apt install ufw -y
sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh

# Install fail2ban for SSH protection
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
```

### 10.4 Install Useful Scripts

```bash
# Create scripts directory
mkdir -p ~/scripts

# Example: Quick system update script
cat > ~/scripts/update.sh << 'EOF'
#!/bin/bash
echo "Updating system..."
sudo apt update && sudo apt upgrade -y && sudo apt autoremove -y
echo "Update complete!"
EOF

chmod +x ~/scripts/update.sh
```

### 10.5 Test Your Installation

Verify that your tools are working:

```bash
# Test network tools
nmap --version
wireshark --version

# Test Python
python3 --version
pip3 --version

# Test Docker
docker run hello-world

# Test metasploit (if installed)
msfconsole -v
```

---

## Quick Reference

### Essential Commands

```bash
# System updates
sudo apt update && sudo apt upgrade -y

# Search for packages
apt search <package-name>

# Install package
sudo apt install <package-name>

# Remove package
sudo apt remove <package-name>

# Clean up
sudo apt autoremove -y
sudo apt autoclean

# Check system info
uname -a
lsb_release -a
```

### Troubleshooting

**VM is slow**:
- Increase RAM allocation
- Allocate more CPU cores
- Enable hardware virtualization in BIOS
- Use fixed-size disk instead of dynamic

**Network not working**:
- Check network adapter settings
- Try different adapter mode (NAT, Bridged)
- Restart networking: `sudo systemctl restart networking`

**Guest Additions won't install**:
- Install kernel headers: `sudo apt install linux-headers-$(uname -r)`
- Update system first: `sudo apt update && sudo apt upgrade`
- Reboot and try again

**Shared folder not accessible**:
- Add user to vboxsf group: `sudo usermod -aG vboxsf $USER`
- Logout and login again
- Check folder is set to auto-mount in VM settings

---

## Automation Option

For advanced users, consider automating this setup with **Ansible**:

1. Create an Ansible playbook with all configurations
2. Run playbook on fresh Kali install
3. Replicate setup across multiple VMs instantly

Example playbook structure:
```yaml
---
- hosts: localhost
  become: yes
  tasks:
    - name: Update system
      apt:
        update_cache: yes
        upgrade: yes
    
    - name: Install tools
      apt:
        name: "{{ item }}"
        state: present
      loop:
        - nmap
        - wireshark
        - metasploit-framework
```

---

## Conclusion

You now have a **fully customized Kali Linux VirtualBox VM** tailored for penetration testing and security research. This setup includes:

- ✅ Optimized system resources
- ✅ Complete tool installation
- ✅ Custom desktop environment
- ✅ Network configuration
- ✅ Shared folders for collaboration
- ✅ Snapshot and backup strategy
- ✅ Security hardening
- ✅ Performance optimizations

### Next Steps

1. **Practice**: Familiarize yourself with Kali tools
2. **Learn**: Take online courses on ethical hacking
3. **Lab Setup**: Create target VMs for practice
4. **Stay Updated**: Keep your tools and system current
5. **Community**: Join Kali forums and communities

### Additional Resources

- [Kali Linux Documentation](https://www.kali.org/docs/)
- [Kali Linux Tools](https://www.kali.org/tools/)
- [Kali Training](https://www.kali.org/training/)
- [VirtualBox Documentation](https://www.virtualbox.org/wiki/Documentation)

---

**Happy Hacking! 🔒🐉**

*Remember: Use these tools only for ethical purposes, authorized testing, and educational activities.*
