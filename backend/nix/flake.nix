{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";

  outputs = { self, nixpkgs }:
    let
      allSystems =
        [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];

      makeNixosConfiguration = system: {
        inherit system;
        modules = [
          ./dev-vm
          ({ pkgs, ... }: {
            virtualisation = nixpkgs.lib.optionalAttrs
              (nixpkgs.lib.elem system [ "x86_64-darwin" "aarch64-darwin" ]) {
                vmVariant = {
                  virtualisation.host.pkgs = nixpkgs.legacyPackages.${system};
                };
              };
          })
        ];
      };
    in {
      devShells = nixpkgs.lib.genAttrs allSystems (system:
        let pkgs = nixpkgs.legacyPackages.${system};
        in {
          default = pkgs.mkShell {
            packages = with pkgs; [ nodejs nodePackages.pnpm dbmate ];
          };
        });
      packages = nixpkgs.lib.genAttrs allSystems (system: {
        dev-vm = self.nixosConfigurations.${system}.config.system.build.vm;
      });

      nixosConfigurations = nixpkgs.lib.genAttrs allSystems
        (system: nixpkgs.lib.nixosSystem (makeNixosConfiguration system));
    };
}
