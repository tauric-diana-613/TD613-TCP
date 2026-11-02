using System;
using System.IO;
using System.IO.Pipes;
using System.Runtime.InteropServices;
using System.Security.Principal;
using System.Threading;
using Microsoft.Win32.SafeHandles;

namespace TD613.Custody {
  // Transport only. No key material, signing, account creation or privilege APIs.
  public static class WindowsPipe {
    [StructLayout(LayoutKind.Sequential)] struct SA { public int Length; public IntPtr Descriptor; public int Inherit; }
    [DllImport("kernel32.dll", CharSet=CharSet.Unicode, SetLastError=true)]
    static extern IntPtr CreateNamedPipe(string name,uint access,uint mode,uint instances,uint output,uint input,uint timeout,ref SA sa);
    [DllImport("kernel32.dll", CharSet=CharSet.Unicode, SetLastError=true)]
    static extern IntPtr CreateFile(string name,uint access,uint share,IntPtr security,uint disposition,uint flags,IntPtr template);
    [DllImport("kernel32.dll", CharSet=CharSet.Unicode, SetLastError=true)]
    static extern bool WaitNamedPipe(string name,uint timeout);
    [DllImport("advapi32.dll",SetLastError=true)] static extern uint GetSecurityInfo(IntPtr handle,int type,uint info,out IntPtr owner,out IntPtr group,out IntPtr dacl,out IntPtr sacl,out IntPtr descriptor);
    [DllImport("kernel32.dll")] static extern IntPtr LocalFree(IntPtr h);
    const int Bound=65536;
    public static string Phase="START";
    public static string PipeNameDigest="";
    static void Require(bool condition) { if(!condition)throw new IOException("WINDOWS_CUSTODY_PIPE_HOLD"); }
    public static string CurrentSid() { return WindowsIdentity.GetCurrent().User.Value; }
    public static bool IsAdministrator() {
      var identity=WindowsIdentity.GetCurrent();
      if(new WindowsPrincipal(identity).IsInRole(WindowsBuiltInRole.Administrator))return true;
      foreach(var group in identity.Groups)if(group.Value=="S-1-5-32-544")return true;
      return false;
    }
    static string InputText() {
      var text=new System.Text.StringBuilder();var buffer=new char[4096];int count;
      while((count=Console.In.Read(buffer,0,buffer.Length))>0){Require(text.Length+count<=Bound);text.Append(buffer,0,count);}
      return text.ToString();
    }
    static string ServerSid(NamedPipeClientStream pipe) {
      IntPtr owner,group,dacl,sacl,descriptor;
      Require(GetSecurityInfo(pipe.SafePipeHandle.DangerousGetHandle(),1,1,out owner,out group,out dacl,out sacl,out descriptor)==0);
      try { return new SecurityIdentifier(owner).Value; }finally { LocalFree(descriptor); }
    }
    static byte[] ReadExact(PipeStream pipe,int count,int timeout) {
      var buffer=new byte[count];int offset=0;
      using(var cancel=new CancellationTokenSource(timeout))while(offset<count) {
        int got=pipe.ReadAsync(buffer,offset,count-offset,cancel.Token).GetAwaiter().GetResult();Require(got>0);offset+=got;
      }
      return buffer;
    }
    static string ReadBody(PipeStream pipe,byte[] length,int timeout) {
      int n=BitConverter.ToInt32(length,0);Require(n>0&&n<=Bound);
      return new System.Text.UTF8Encoding(false,true).GetString(ReadExact(pipe,n,timeout));
    }
    static void Write(PipeStream pipe,string text,int timeout) {
      var b=new System.Text.UTF8Encoding(false,true).GetBytes(text);Require(b.Length>0&&b.Length<=Bound);
      using(var cancel=new CancellationTokenSource(timeout)) {
        var header=BitConverter.GetBytes(b.Length);
        pipe.WriteAsync(header,0,4,cancel.Token).GetAwaiter().GetResult();
        pipe.WriteAsync(b,0,b.Length,cancel.Token).GetAwaiter().GetResult();
        pipe.FlushAsync(cancel.Token).GetAwaiter().GetResult();
      }
    }
    public sealed class Server : IDisposable {
      NamedPipeServerStream pipe;string callerSid;int timeout;
      public Server(string name,string ownerSid,string controllerSid,string engineeringSid,int timeoutMs) {
        Require(CurrentSid()==ownerSid&&!IsAdministrator());
        Require(System.Text.RegularExpressions.Regex.IsMatch(name,"^TD613-Custody-[A-Za-z0-9-]{8,80}$"));
        new SecurityIdentifier(ownerSid);new SecurityIdentifier(controllerSid);new SecurityIdentifier(engineeringSid);
        Require(timeoutMs>=100&&timeoutMs<=60000);
        var security=new PipeSecurity();
        security.SetOwner(new SecurityIdentifier(ownerSid));
        // Remote/network and engineering identities are denied. The accepted
        // controller can exchange metadata, never root material.
        security.SetSecurityDescriptorSddlForm("D:P(D;;GA;;;NU)(D;;GA;;;"+engineeringSid+")(A;;GA;;;"+ownerSid+")(A;;0x12019b;;;"+controllerSid+")");
        security.SetOwner(new SecurityIdentifier(ownerSid));
        var bytes=security.GetSecurityDescriptorBinaryForm();IntPtr descriptor=Marshal.AllocHGlobal(bytes.Length);
        try { Marshal.Copy(bytes,0,descriptor,bytes.Length);var sa=new SA {Length=Marshal.SizeOf(typeof(SA)),Descriptor=descriptor,Inherit=0};
          // Duplex + overlapped + first instance; byte mode + reject remote clients.
          IntPtr h=CreateNamedPipe(@"\\.\pipe\"+name,0x40080003,0x8,1,Bound,Bound,0,ref sa);
          Require(h!=new IntPtr(-1));pipe=new NamedPipeServerStream(PipeDirection.InOut,true,false,new SafePipeHandle(h,true));
        }finally { Marshal.FreeHGlobal(descriptor); }
        callerSid=controllerSid;timeout=timeoutMs;
      }
      public string Receive() {
        Phase="SERVER_CONNECT";
        if(pipe.IsConnected)pipe.Disconnect();
        pipe.WaitForConnection();
        Phase="SERVER_READ_HEADER";
        var header=ReadExact(pipe,4,timeout);string observed=null;
        Phase="SERVER_IDENTIFY_CLIENT";
        pipe.RunAsClient(delegate { var id=WindowsIdentity.GetCurrent(true);if(id!=null)observed=id.User.Value; });
        Require(observed==callerSid);return ReadBody(pipe,header,timeout);
      }
      public void Reply(string text) { Write(pipe,text,timeout); }
      public void Dispose() { if(pipe!=null)pipe.Dispose(); }
    }
    public static string Client(string name,string ownerSid,string controllerSid,int timeout,string request) {
      Require(CurrentSid()==controllerSid&&!IsAdministrator());
      Require(timeout>=100&&timeout<=60000);
      PipeNameDigest=BitConverter.ToString(System.Security.Cryptography.SHA256.Create().ComputeHash(System.Text.Encoding.UTF8.GetBytes(name))).Replace("-","");
      Phase="WAIT_PIPE";string full=@"\\.\pipe\"+name;Require(WaitNamedPipe(full,(uint)timeout));
      // Individual read/write rights exclude FILE_CREATE_PIPE_INSTANCE. SQOS
      // permits identification only, not acting with the controller's authority.
      Phase="OPEN_PIPE";IntPtr h=CreateFile(full,0x12019b,0,IntPtr.Zero,3,0x40110000,IntPtr.Zero);Require(h!=new IntPtr(-1));
      using(var pipe=new NamedPipeClientStream(PipeDirection.InOut,true,true,new SafePipeHandle(h,true))) {
        Phase="VERIFY_OWNER";Require(ServerSid(pipe)==ownerSid);Phase="WRITE_FRAME";Write(pipe,request,timeout);
        Phase="READ_REPLY";return ReadBody(pipe,ReadExact(pipe,4,timeout),timeout);
      }
    }
    public static int Main(string[] args) {
      try { Require(args.Length==4);
#if CUSTODY_SYSTEM_AUDIT
        if(args[0]=="--audit-read"||args[0]=="--audit-publish") {
          Phase="INDEPENDENT_SYSTEM_AUDIT";
          Require(CurrentSid()==args[2]&&!IsAdministrator());
          Require(args[1]=="TD613Custody"&&System.Text.RegularExpressions.Regex.IsMatch(args[3],"^[A-Za-z0-9._-]{1,128}$"));
          using(var source=Microsoft.Win32.Registry.LocalMachine.OpenSubKey(@"SYSTEM\CurrentControlSet\Services\EventLog\TD613Custody\TD613Custody",false))Require(source!=null);
          using(var policy=new System.Diagnostics.EventLog(args[1]))Require(policy.OverflowAction==System.Diagnostics.OverflowAction.DoNotOverwrite);
          if(args[0]=="--audit-publish") {
            var text=InputText();
            System.Diagnostics.EventLog.WriteEntry(args[1],text,System.Diagnostics.EventLogEntryType.Information,613);
            Console.WriteLine("{\"status\":\"OK\"}");
          } else using(var log=new System.Diagnostics.EventLog(args[1])) {
            string record=null;
            for(int n=log.Entries.Count-1;n>=0;n--) {
              var values=log.Entries[n].ReplacementStrings;
              if(values.Length>0&&values[0].Contains("\"issuer\":\""+args[3]+"\"")) {record=values[0];break;}
            }
            Console.WriteLine(record??"null");
          }
          return 0;
        }
#endif
        var textInput=InputText();
        Console.WriteLine(Client(args[0],args[1],args[2],Int32.Parse(args[3]),textInput));return 0;
      }catch { Console.WriteLine("{\"status\":\"HOLD\",\"code\":\"WINDOWS_PIPE_AUTHENTICATION_OR_IO_HOLD\",\"phase\":\""+Phase+"\",\"nativeCode\":"+Marshal.GetLastWin32Error()+",\"pipeNameDigest\":\""+PipeNameDigest+"\"}");return 1; }
    }
  }
}
