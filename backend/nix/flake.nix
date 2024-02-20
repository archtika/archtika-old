{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";

  outputs = { self, nixpkgs }: let
    allSystems = [
      "x86_64-linux"
      "aarch64-linux"
      "x86_64-darwin"
      "aarch64-darwin"
    ];

    forAllSystems = f: nixpkgs.lib.genAttrs allSystems (system: f {
      pkgs = nixpkgs.legacyPackages.${system};
    });
  in {
    devShells = forAllSystems ({ pkgs }: {
      default = pkgs.mkShell {
        packages = with pkgs; [
          nodejs
          nodePackages.pnpm
          dbmate
        ];
      };
    });
    packages = {
      x86_64-linux.dev-vm = self.nixosConfigurations.dev-vm.config.system.build.vm;
      aarch64-darwin.dev-vm = self.nixosConfigurations.dev-vm.config.system.build.vm;
    };
    nixosConfigurations = {
      dev-vm = nixpkgs.lib.nixosSystem {
        system = "x86_64-linux";
        modules = [
          ./dev-vm
        ];
      };
    };
  };
}
