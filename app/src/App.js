import './App.css';
import {
  useState, useEffect
} from 'react';
import {
  Connection,
  PublicKey
} from '@solana/web3.js';
import {
  Program,
  Provider,
  web3
} from '@project-serum/anchor';
import * as anchor from '@project-serum/anchor';
import idl from './ehr.json';
import {
  getPhantomWallet
} from '@solana/wallet-adapter-wallets';
import {
  useWallet,
  WalletProvider,
  ConnectionProvider
} from '@solana/wallet-adapter-react';
import {
  WalletModalProvider,
  WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { useSnackbar } from "notistack";
import HomePage from './components/HomePage';
import ListPatients from './components/ListPatients';
import ListDoctors from './components/ListDoctors';
import 'bootstrap/dist/css/bootstrap.min.css';

const wallets = [
  /* view list of available wallets at https://github.com/solana-labs/wallet-adapter#wallets */
  getPhantomWallet()
]

const {
  SystemProgram,
  Keypair
} = web3;
/* create an account  */
const baseAccount = Keypair.generate();
const opts = {
  preflightCommitment: "processed"
}
const programID = new PublicKey(idl.metadata.address);
console.log("Program ID")
console.log(programID)

function App() {
  const [state, setStateValue] = useState({
    patients: [],
    doctors: [],
    profileType: '',
    profile: null,
    isLoggedIn: false,
  });
  const wallet = useWallet();
  const enqueSnackbar = useSnackbar();

  async function getProvider() {
    const network = "http://127.0.0.1:8899";
    const connection = new Connection(network, opts.preflightCommitment);

    const provider = new Provider(
      connection, wallet, opts.preflightCommitment,
    );
    return provider;
  }

  async function getDoctors() {
    const provider = await getProvider();
    const program = new Program(idl, programID, provider);
    const doctorAccounts = await program.account.doctorProfile.all();
    console.log("Doctor Accounts : ",doctorAccounts);
    setStateValue({...state, doctors: doctorAccounts});
  }

  async function getDoctor() {
    const provider = await getProvider()
    console.log(programID.toBase58());
    let doctorProfile = null;
    const program = new Program(idl, programID, provider);
    try {
      const [userPda, userBump] = await PublicKey.findProgramAddress(
        [
          Buffer.from("doctor-profile"),
          provider.wallet.publicKey.toBuffer()
        ],
        programID
      );
      doctorProfile = await program.account.doctorProfile.fetch(userPda);
    } catch {
      console.log("Error fetching doctor profile")
    }
      return doctorProfile ? doctorProfile : null;
  }

  async function getPatients() {
    const provider = await getProvider();
    const program = new Program(idl, programID, provider);
    const patientAccounts = await program.account.patientProfile.all();
    console.log("Patient Accounts : ",patientAccounts);
    setStateValue({...state, patients: patientAccounts});
  }

  async function getPatient() {
    const provider = await getProvider()
    console.log(programID.toBase58());
    let profile = null;
    const program = new Program(idl, programID, provider);
    try {
      const [userPda, userBump] = await PublicKey.findProgramAddress(
        [
          Buffer.from("patient-profile"),
          provider.wallet.publicKey.toBuffer()
        ],
        programID
      );
      profile = await program.account.patientProfile.fetch(userPda);
    } catch {
      console.log("Error fetching patient profile")
    }
      return profile;
  }

  async function getTechnicians() {
    const provider = await getProvider();
    const program = new Program(idl, programID, provider);
    const technicianAccounts = await program.account.technicianProfile.all();
    console.log("Technician Accounts : ",technicianAccounts);
  }

  async function getTechnician() {
    const provider = await getProvider()
    console.log(programID.toBase58());
    let profile = null;
    const program = new Program(idl, programID, provider);
    try {
      const [userPda, userBump] = await PublicKey.findProgramAddress(
        [
          Buffer.from("technician-profile"),
          provider.wallet.publicKey.toBuffer()
        ],
        programID
      );
      profile = await program.account.technicianProfile.fetch(userPda);
    } catch(e) {
      console.log("Error fetching technician profile")
      console.log(e)
    }
      return profile;
  }


  async function getBloodReports() {
    const provider = await getProvider();
    const program = new Program(idl, programID, provider);
    const bloodTestReports = await program.account.bloodtestReport.all();
    console.log("Technician Accounts : ",bloodTestReports);
  }

  async function getGeneralConsultancy() {
    const provider = await getProvider();
    const program = new Program(idl, programID, provider);
    const bloodTestReports = await program.account.generalConsultancy.all();
    console.log("Technician Accounts : ",bloodTestReports);
  }

  async function getAllAccounts() {
    getDoctors();
    getPatients();
    getTechnicians();
    getBloodReports();
    getGeneralConsultancy();
  }

  async function getProfileDetails() {
    const profileCheckers = [
      {type: "specialist", checker: getDoctor},
      {type: "patient", checker: getPatient},
      {type: "technician", checker: getTechnician},
      ];
    profileCheckers.forEach(checker => {
        checker.checker().then(data => {
          if (data) {
            setStateValue({...state, profile: data, profileType: checker.type, isLoggedIn: true})
          }
        }).catch(e => {console.log(e)});
    });
  };

  async function createDoctorAccount(values) {
    const {name, sex, dob, consultFee, experience=60} = values;
    const provider = await getProvider();
    const program = new Program(idl, programID, provider);
    var new_keypar = web3.Keypair.generate();
    try {
      const [newDoctorPda,newDoctorBump] = await PublicKey.findProgramAddress(
        [
          anchor.utils.bytes.utf8.encode("doctor-profile"),
          provider.wallet.publicKey.toBuffer()
        ],
        programID
      );;
      let gc_fee_bn = new anchor.BN(consultFee);
      let time = new anchor.BN(Date.now() / 1000);
      const doctor_profile = await program.rpc.initDoctorProfile(name,sex,dob,experience,gc_fee_bn,true,time,{
        accounts: {
          doctorProfile: newDoctorPda,
          doctor: provider.wallet.publicKey,
          systemProgram: web3.SystemProgram.programId
        }
      });
      getProfileDetails();
    } catch (error) {
      
    }
  }

  async function createPatientAccount(values) {
    const {name, sex, dob } = values;
    const provider = await getProvider();
    const program = new Program(idl, programID, provider);
    var new_keypar = web3.Keypair.generate();
    try {
      const [newPatientPda,newPatientBump] = await PublicKey.findProgramAddress(
        [
          anchor.utils.bytes.utf8.encode("patient-profile"),
          provider.wallet.publicKey.toBuffer()
        ],
        programID
      );
      const patient_profile = await program.rpc.initPatientProfile(name,sex,dob,{
        accounts: {
          patientProfile: newPatientPda,
          patient: provider.wallet.publicKey,
          systemProgram: web3.SystemProgram.programId
        }
      });
      getProfileDetails();
    } catch (error) {
      
    }
  }

  async function createTechinicianAccount(values) {
    const {name, sex, dob, consultFee, experience=60} = values;
    const provider = await getProvider();
    const program = new Program(idl, programID, provider);
    var new_keypar = web3.Keypair.generate();
    try {
      const [newTechnicianPda,newDoctorBump] = await PublicKey.findProgramAddress(
        [
          anchor.utils.bytes.utf8.encode("technician-profile"),
          provider.wallet.publicKey.toBuffer()
        ],
        programID
      );
      let gc_fee_bn = new anchor.BN(consultFee);
      let time = new anchor.BN(Date.now() / 1000);
      const technician_profile = await program.rpc.initTechnicianProfile(name,sex,dob,experience,gc_fee_bn,true,time,{
        accounts: {
          technicianProfile: newTechnicianPda,
          technician: provider.wallet.publicKey,
          systemProgram: web3.SystemProgram.programId
        }
      });
      getProfileDetails();
    }
    catch {

    }
    
  }

  async function createBloodTestBooking(doctor, patient) {
    const provider = await getProvider();
    const program = new Program(idl, programID, provider);
    var new_keypar = web3.Keypair.generate();
    const [bloodTestPda,bloodTestBump] = await PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode("bloodtest-report"),
        provider.wallet.publicKey.toBuffer()
      ],
      programID
    );
    const patientAccounts = await program.account.patientProfile.all();
    const technicianAccounts = await program.account.technicianProfile.all();
    const [patientPda,patientBump] = await PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode("bloodtest-report"),
        patientAccounts[0].publicKey.toBuffer()
      ],
      programID
    );
    const [technicianPda,technicianBump] = await PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode("technician-profile"),
        technicianAccounts[0].publicKey.toBuffer()
      ],
      programID
    );
    const blood_test_booking = await program.rpc.initBloodtestBooking({
      accounts: {
        bloodtestReport: bloodTestPda,
        patientProfile: patientPda,
        technicianProfile: technicianPda,
        patientDepositTokenAccount: '',
        uhwDaoWallet: '',
        patient: '',
        systemProgram: web3.SystemProgram.programId,
        tokenProgram: ''
      }
    })
  }

  useEffect(() => {
    getProfileDetails()
  }, [wallet.connected]);

  if (state.isLoggedIn && wallet.connected ) {;
    return(
      <div className='c-dashboard'>
      <div className='c-dashboard-nav u-text-center'>
        <div className='u-m-t--30'>
        <span className='u-text--alpha u-text-cyan u-text--bold u-text-font--xmb'>UHW</span>
        </div>
        <div className='u-m-t--45'>
        <div className='u-text--beta u-text-magenta u-text--bold u-text-font--mb u-text-center'>{state.profile && (state.profile.doctorName || state.profile.name || state.profile.technicianName)}</div>
        <div className='u-text-magenta'>{state.profileType}</div>
        </div>
        <div className='u-m-t--45'>
          <WalletMultiButton />
        </div>
      </div>
      <div className='c-dashboard-content'>
        {state.profileType === "specialist" && (
          <ListPatients patients={state.patients} getPatients={getPatients} />
        )
        }
        {
          state.profileType === "patient" && (
          <ListDoctors doctors={state.doctors} getDoctors={getDoctors} />
          )
        }
      </div>
    </div>
    )
  } else {
    return ( 
      <HomePage
        wallet={wallet}
        doctorCreator={createDoctorAccount}
        patientCreator={createPatientAccount}
        technicianCreator={createTechinicianAccount}
      />
    )
    }
  }

  const AppWithProvider = () => ( 
    <ConnectionProvider endpoint = "http://127.0.0.1:8899" >
    <WalletProvider wallets={wallets} autoConnect >
    <WalletModalProvider >
    <App />
    </WalletModalProvider> </WalletProvider> </ConnectionProvider>
  )

  export default AppWithProvider;
