// Migrations are an early feature. Currently, they're nothing more than this
// single deploy script that's invoked from the CLI, injecting a provider
// configured from the workspace's Anchor.toml.

import { bofoiProgramId, getStatePda } from "../app";

const anchor = require("@coral-xyz/anchor");
const { IDL } = require("../target/types/bofoi");

const programId = new anchor.web3.PublicKey(
  "8Kc1XgpHpMEqC8nTEAzqXU61m9drjrEujLGMgDwXfk9r"
);

/**
 *
 * @param {import("@coral-xyz/anchor").AnchorProvider} provider
 */
module.exports = async function (provider) {
  // Configure client to use the provider.
  anchor.setProvider(provider);
  const program: import("@coral-xyz/anchor").Program<
    import("../target/types/bofoi").Bofoi
  > = new anchor.Program(IDL, bofoiProgramId, provider);

  const [state, bump] = getStatePda();
  const tx = await program.methods.initialize(bump).accounts({ state }).rpc();

  console.log("state=", state);
  console.log("tx=", tx);
};
