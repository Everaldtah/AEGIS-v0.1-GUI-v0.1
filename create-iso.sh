#!/bin/bash
# AEGIS Studio ISO Builder
# Creates a custom Ubuntu ISO with AEGIS Studio pre-installed

set -e

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     AEGIS Studio - Custom ISO Builder                         ║"
echo "║     Creates bootable ISO with AEGIS Studio pre-installed      ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root (use sudo)"
    exit 1
fi

# Configuration
ISO_VERSION="0.1.0"
UBUNTU_VERSION="24.04"
UBUNTU_ISO="ubuntu-${UBUNTU_VERSION}-server-amd64.iso"
WORK_DIR="$(pwd)/iso-build"
MOUNT_DIR="$WORK_DIR/mount"
EXTRACT_DIR="$WORK_DIR/extract"
SQUASHFS_DIR="$WORK_DIR/squashfs"
OUTPUT_DIR="$(pwd)"

echo "Step 1: Downloading Ubuntu Server ISO..."
if [ ! -f "$UBUNTU_ISO" ]; then
    wget "https://releases.ubuntu.com/${UBUNTU_VERSION}/$UBUNTU_ISO" || {
        echo "Download failed. Please download manually from:"
        echo "https://ubuntu.com/download/server"
        exit 1
    }
fi

echo "Step 2: Creating working directories..."
mkdir -p "$WORK_DIR" "$MOUNT_DIR" "$EXTRACT_DIR" "$SQUASHFS_DIR"

echo "Step 3: Mounting ISO..."
mount -o loop "$UBUNTU_ISO" "$MOUNT_DIR"

echo "Step 4: Extracting ISO contents..."
rsync --exclude=/casper/*.squashfs -a "$MOUNT_DIR/" "$EXTRACT_DIR/"

echo "Step 5: Extracting squashfs..."
unsquashfs -f -d "$SQUASHFS_DIR" "$MOUNT_DIR/casper/filesystem.squashfs"

echo "Step 6: Chroot into filesystem to install AEGIS..."

# Mount necessary filesystems
mount --bind /dev "$SQUASHFS_DIR/dev"
mount --bind /dev/pts "$SQUASHFS_DIR/dev/pts"
mount --bind /proc "$SQUASHFS_DIR/proc"
mount --bind /sys "$SQUASHFS_DIR/sys"

# Copy installation script
cp install-aegis-vm.sh "$SQUASHFS_DIR/root/"
cp -r ../AEGIS* "$SQUASHFS_DIR/root/" 2>/dev/null || true

# Chroot and install
chroot "$SQUASHFS_DIR" /bin/bash -c "
    cd /root
    bash install-aegis-vm.sh
"

# Unmount filesystems
umount "$SQUASHFS_DIR/sys"
umount "$SQUASHFS_DIR/proc"
umount "$SQUASHFS_DIR/dev/pts"
umount "$SQUASHFS_DIR/dev"

echo "Step 7: Recreating squashfs..."
mksquashfs "$SQUASHFS_DIR" "$EXTRACT_DIR/casper/filesystem.squashfs" -comp xz

echo "Step 8: Updating filesystem size..."
DU=$(du -sx --block-size=1 "$SQUASHFS_DIR" | cut -f1)
echo $DU > "$EXTRACT_DIR/casper/filesystem.size"

echo "Step 9: Creating ISO..."
cd "$EXTRACT_DIR"

# Calculate MD5
find . -type f -print0 | xargs -0 md5sum | grep -v "\./md5sum.txt" > md5sum.txt

# Create ISO
xorriso -as mkisofs \
    -r -V "AEGIS-Studio-$ISO_VERSION" \
    -o "$OUTPUT_DIR/aegis-studio-${ISO_VERSION}.amd64.iso" \
    -J -l -b isolinux/isolinux.bin \
    -c isolinux/boot.cat \
    -no-emul-boot \
    -boot-load-size 4 \
    -boot-info-table \
    -eltorito-alt-boot \
    -e EFI/BOOT/BOOTAA64.EFI \
    -no-emul-boot \
    -isohybrid-gpt-basdat \
    -isohybrid-apm-hfsplus \
    .

echo "Step 10: Cleanup..."
umount "$MOUNT_DIR"
rm -rf "$WORK_DIR"

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     ✓ ISO Created Successfully!                              ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "ISO Location: $OUTPUT_DIR/aegis-studio-${ISO_VERSION}.amd64.iso"
echo ""
echo "To use in VirtualBox:"
echo "  1. Create new VM"
echo "  2. Mount the ISO as CD/DVD"
echo "  3. Start VM and install"
echo ""
echo "Default credentials:"
echo "  Username: aegis"
echo "  Password: aegisstudio"
echo "  Web UI: http://localhost:5173 (after boot)"
