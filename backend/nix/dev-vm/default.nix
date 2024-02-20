{ pkgs, lib, ... }: {
  imports = [ <nixpkgs/nixos/modules/virtualisation/qemu-vm.nix> ];

  users.users.root = {
    password = "root";
  };

  virtualisation.forwardPorts = [
    { from = "host"; host.port = 5432; guest.port = 5432; }
  ];
  virtualisation.graphics = false;

  networking.firewall = {
    allowedTCPPorts = [ 5432 ];
    allowedUDPPorts = [ 5432 ];
  };

  services.postgresql = {
    enable = true;
    package = pkgs.postgresql_15;
    ensureDatabases = [ "archtika" ];
    authentication = lib.mkForce ''
      local all all trust
    '';
  };

  system.stateVersion = "24.05";
}