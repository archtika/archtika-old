{ pkgs, lib, ... }: {
  imports = [ <nixpkgs/nixos/modules/virtualisation/qemu-vm.nix> ];

  networking.hostName = "archtika";

  users.users.dev = {
    isNormalUser = true;
    extraGroups = [ "wheel" ];
    password = "dev";
  };

  virtualisation.forwardPorts = [
    {
      from = "host";
      host.port = 15432;
      guest.port = 5432;
    }
    {
      from = "host";
      host.port = 3901;
      guest.port = 3901;
    }
    {
      from = "host";
      host.port = 3902;
      guest.port = 3902;
    }
    {
      from = "host";
      host.port = 3903;
      guest.port = 3903;
    }
  ];
  virtualisation.graphics = false;

  networking.firewall = {
    allowedTCPPorts = [ 5432 3901 3902 3903 ];
    allowedUDPPorts = [ 5432 3901 3902 3903 ];
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
    garage = {
      enable = true;
      package = pkgs.garage_0_9_2;
      settings = {
        replication_mode = "1";

        rpc_bind_addr = "[::]:3901";
        rpc_public_addr = "127.0.0.1:3901";
        rpc_secret =
          "5c1915fa04d0b6739675c61bf5907eb0fe3d9c69850c83820f51b4d25d13868c";

        s3_api = {
          s3_region = "garage";
          api_bind_addr = "[::]:3902";
          root_domain = ".s3.garage";
        };

        s3_web = {
          bind_addr = "[::]:3903";
          root_domain = ".web.garage";
          index = "index.html";
        };
      };
    };
  };

  system.stateVersion = "24.05";
}
