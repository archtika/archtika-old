{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";

  outputs = { self, nixpkgs }:
    let
      allSystems =
        [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];

      forAllSystems = nixpkgs.lib.genAttrs allSystems;

      makeNixosConfiguration = system: {
        inherit system;
        modules = [
          ./dev-vm.nix
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
      devShells = forAllSystems (system:
        let pkgs = nixpkgs.legacyPackages.${system};
        in {
          default = pkgs.mkShell {
            packages = with pkgs; [ nodejs nodePackages.pnpm dbmate ];
            shellHook = ''
              alias dbmate="dbmate -u 'postgres://postgres@localhost:15432/archtika?sslmode=disable'"
              alias datestring="TZ=UTC date "+%Y-%m-%d-%H-%M-%S"
            '';
          };
        });
      packages = forAllSystems (system: {
        dev-vm = self.nixosConfigurations.${system}.config.system.build.vm;
      });

      nixosConfigurations = forAllSystems
        (system: nixpkgs.lib.nixosSystem (makeNixosConfiguration system));

      formatter = forAllSystems
        (system: let pkgs = nixpkgs.legacyPackages.${system}; in pkgs.nixfmt);
    };
}
