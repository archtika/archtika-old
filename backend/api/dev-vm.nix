{ pkgs, lib, ... }: {
  imports = [ <nixpkgs/nixos/modules/virtualisation/qemu-vm.nix> ];

  networking.hostName = "archtika";

  nix.settings.experimental-features = [ "nix-command flakes" ];

  users.users.dev = {
    isNormalUser = true;
    extraGroups = [ "wheel" ];
    password = "dev";
  };

  virtualisation = {
    graphics = false;
    memorySize = 2048;
    forwardPorts = [
      {
        from = "host";
        host.port = 15432;
        guest.port = 5432;
      }
      {
        from = "host";
        host.port = 16379;
        guest.port = 6379;
      }
      {
        from = "host";
        host.port = 19000;
        guest.port = 9000;
      }
      {
        from = "host";
        host.port = 19001;
        guest.port = 9001;
      }
    ];
  };

  networking.firewall = {
    allowedTCPPorts = [ 5432 9000 9001 ];
    allowedUDPPorts = [ 5432 9000 9001 ];
  };

  services = {
    postgresql = {
      enable = true;
      package = pkgs.postgresql_15;
      ensureDatabases = [ "archtika" ];
      authentication = lib.mkForce ''
        local all all trust
        host all all all trust
      '';
      enableTCPIP = true;
    };
    redis.servers = {
      archtika = {
        enable = true;
        bind = null;
        requirePass = "dev";
        port = 6379;
        openFirewall = true;
      };
    };
    minio = {
      enable = true;
      listenAddress = "0.0.0.0:9000";
      consoleAddress = "0.0.0.0:9001";
    };
  };

  system.stateVersion = "24.05";
}
