import {
  ContractStorage,
  Deployment,
  genEmptyBallotRoots,
  type IDeployParams,
  type GitcoinPassportGatekeeper,
  type EASGatekeeper,
  type ZupassGatekeeper,
  type SemaphoreGatekeeper,
  type HatsGatekeeperBase,
} from "maci-contracts";

import { MACI } from "../../../typechain-types";
import { EDeploySteps, EContracts } from "../../helpers/constants";

const deployment = Deployment.getInstance({ contractNames: EContracts });
const storage = ContractStorage.getInstance();

const DEFAULT_STATE_TREE_DEPTH = 10;

/**
 * Deploy step registration and task itself
 */
deployment.deployTask(EDeploySteps.Maci, "Deploy MACI contract").then((task) =>
  task.setAction(async ({ incremental }: IDeployParams, hre) => {
    deployment.setHre(hre);
    deployment.setContractNames(EContracts);
    const deployer = await deployment.getDeployer();

    const maciContractAddress = storage.getAddress(EContracts.MACI, hre.network.name);

    if (incremental && maciContractAddress) {
      return;
    }

    const poseidonT3ContractAddress = storage.mustGetAddress(EContracts.PoseidonT3, hre.network.name);
    const poseidonT4ContractAddress = storage.mustGetAddress(EContracts.PoseidonT4, hre.network.name);
    const poseidonT5ContractAddress = storage.mustGetAddress(EContracts.PoseidonT5, hre.network.name);
    const poseidonT6ContractAddress = storage.mustGetAddress(EContracts.PoseidonT6, hre.network.name);

    const maciContractFactory = await hre.ethers.getContractFactory("contracts/maci/MACI.sol:MACI", {
      signer: deployer,
      libraries: {
        PoseidonT3: poseidonT3ContractAddress,
        PoseidonT4: poseidonT4ContractAddress,
        PoseidonT5: poseidonT5ContractAddress,
        PoseidonT6: poseidonT6ContractAddress,
      },
    });

    const constantInitialVoiceCreditProxyContractAddress = storage.mustGetAddress(
      EContracts.ConstantInitialVoiceCreditProxy,
      hre.network.name,
    );
    const gatekeeper =
      deployment.getDeployConfigField<keyof typeof EContracts | null>(EContracts.MACI, "gatekeeper") ||
      EContracts.FreeForAllGatekeeper;
    const gatekeeperContractAddress = storage.mustGetAddress(gatekeeper, hre.network.name);
    const pollFactoryContractAddress = storage.mustGetAddress(EContracts.PollFactory, hre.network.name);
    const messageProcessorFactoryContractAddress = storage.mustGetAddress(
      EContracts.MessageProcessorFactory,
      hre.network.name,
    );
    const tallyFactoryContractAddress = storage.mustGetAddress(EContracts.TallyFactory, hre.network.name);

    const stateTreeDepth =
      deployment.getDeployConfigField<number | null>(EContracts.MACI, "stateTreeDepth") ?? DEFAULT_STATE_TREE_DEPTH;

    const emptyBallotRoots = genEmptyBallotRoots(stateTreeDepth);

    const maciContract = await deployment.deployContractWithLinkedLibraries<MACI>(
      { contractFactory: maciContractFactory },
      pollFactoryContractAddress,
      messageProcessorFactoryContractAddress,
      tallyFactoryContractAddress,
      gatekeeperContractAddress,
      constantInitialVoiceCreditProxyContractAddress,
      stateTreeDepth,
      emptyBallotRoots,
    );

    if (gatekeeper === EContracts.EASGatekeeper) {
      const gatekeeperContract = await deployment.getContract<EASGatekeeper>({
        name: EContracts.EASGatekeeper,
        address: gatekeeperContractAddress,
      });
      const maciInstanceAddress = await maciContract.getAddress();

      await gatekeeperContract.setMaciInstance(maciInstanceAddress).then((tx) => tx.wait());
    } else if (gatekeeper === EContracts.GitcoinPassportGatekeeper) {
      const gatekeeperContract = await deployment.getContract<GitcoinPassportGatekeeper>({
        name: EContracts.GitcoinPassportGatekeeper,
        address: gatekeeperContractAddress,
      });
      const maciInstanceAddress = await maciContract.getAddress();

      await gatekeeperContract.setMaciInstance(maciInstanceAddress).then((tx) => tx.wait());
    } else if (gatekeeper === EContracts.ZupassGatekeeper) {
      const gatekeeperContract = await deployment.getContract<ZupassGatekeeper>({
        name: EContracts.ZupassGatekeeper,
        address: gatekeeperContractAddress,
      });
      const maciInstanceAddress = await maciContract.getAddress();
      await gatekeeperContract.setMaciInstance(maciInstanceAddress).then((tx) => tx.wait());
    } else if (gatekeeper === EContracts.SemaphoreGatekeeper) {
      const gatekeeperContract = await deployment.getContract<SemaphoreGatekeeper>({
        name: EContracts.SemaphoreGatekeeper,
        address: gatekeeperContractAddress,
      });

      const maciInstanceAddress = await maciContract.getAddress();
      await gatekeeperContract.setMaciInstance(maciInstanceAddress).then((tx) => tx.wait());
    } else if (gatekeeper === EContracts.HatsGatekeeper) {
      const gatekeeperContract = await deployment.getContract<HatsGatekeeperBase>({
        name: EContracts.HatsGatekeeper,
        address: gatekeeperContractAddress,
      });

      const maciInstanceAddress = await maciContract.getAddress();
      await gatekeeperContract.setMaciInstance(maciInstanceAddress).then((tx) => tx.wait());
    }

    await storage.register({
      id: EContracts.MACI,
      contract: maciContract,
      args: [
        pollFactoryContractAddress,
        messageProcessorFactoryContractAddress,
        tallyFactoryContractAddress,
        gatekeeperContractAddress,
        constantInitialVoiceCreditProxyContractAddress,
        stateTreeDepth,
        emptyBallotRoots.map((root) => root.toString()),
      ],
      network: hre.network.name,
    });
  }),
);
