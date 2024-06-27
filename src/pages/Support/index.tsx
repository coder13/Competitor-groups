import { useEffect } from 'react';
import { Container } from '../../components/Container';

export default function Support() {
  useEffect(() => {
    document.title = 'Support - Competition Groups';
  }, []);

  return (
    <Container className="overflow-auto">
      <div className="flex flex-col items-center">
        <div className="flex flex-col max-w- pt-2 w-full text-sm md:text-base p-2 md:px-0  text-gray-800 space-y-4">
          <p>Thanks for being a user of Competition Groups!</p>
          <p>
            This website is a passion project by Cailyn Hoover.
            <br />I do not receive any compensation for developing this platform, and if you find
            this website useful, please consider supporting me by buying me a coffee
          </p>
          <iframe
            id="kofiframe"
            src="https://ko-fi.com/klynh/?hidefeed=true&widget=true&embed=true&preview=true"
            className="border-none w-full p-2"
            height="800"
            title="klynh"
          />
        </div>
      </div>
    </Container>
  );
}
