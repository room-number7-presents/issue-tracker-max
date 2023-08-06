import { useTheme } from '@emotion/react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Title } from '@components/addIssuePage/Title';
import { Body } from '@components/addIssuePage/Body';
import { UserImage } from '@components/addIssuePage/UserImage';
import { UserImageContainer } from '@components/addIssuePage/UserImageContainer';
import { InputContainer } from '@components/addIssuePage/InputContainer';
import { TextArea } from '@components/common/TextArea';
import { SideBar } from '@components/common/sideBar/SideBar';
import { ListSideBar } from '@components/common/sideBar/ListSideBar';
import { ButtonContainer } from '@components/addIssuePage/ButtonContainer';
import { Button } from '@components/common/Button';
import { ReactComponent as XSquare } from '@assets/icons/xSquare.svg';
import { TextInput } from '@components/common/TextInput/TextInput';

// type SelectedItems = {
//   [key: number]: boolean;
// };

// type SelectionState = {
//   assignees: SelectedItems;
//   labels: SelectedItems;
//   milestones: SelectedItems;
// };
type SelectionState = {
  assignees: number[];
  labels: number[];
  milestones: number[];
};
// 추후 구현 보완시 추가
// type Props = {
//   authorId: number;
//   userImage: string;
// };

export const AddIssuePage: React.FC = ({}) => {
  const theme = useTheme() as any;
  const navigate = useNavigate();
  const userImage = 'https://avatars.githubusercontent.com/u/57523197?v=4'; //임시 이미지
  const availableFileSize = 1048576; //1MB

  const defaultFileStatus = {
    typeError: false,
    sizeError: false,
    isUploading: false,
    uploadFailed: false,
  };

  const [selections, setSelections] = useState<SelectionState>({
    assignees: [],
    labels: [],
    milestones: [],
  });

  const [titleInput, setTitleInput] = useState<string>('');
  const [textAreaValue, setTextAreaValue] = useState<string>('');
  const [isDisplayingCount, setIsDisplayingCount] = useState(false);

  const [fileStatus, setFileStatus] = useState(defaultFileStatus);

  const uploadImage = async (file: File) => {
    try {
      setFileStatus((prev) => ({ ...prev, isUploading: true }));

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/file-upload`,
        {
          method: 'POST',
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error('File upload failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      setFileStatus((prev) => ({ ...prev, uploadFailed: true }));
    } finally {
      setFileStatus((prev) => ({ ...prev, isUploading: false }));
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileStatus((prev) => ({ ...prev, sizeError: false }));
    setFileStatus((prev) => ({ ...prev, typeError: false }));
    setFileStatus((prev) => ({ ...prev, uploadFailed: false }));

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (!file) {
        setFileStatus((prev) => ({ ...prev, uploadFailed: true }));
        return;
      }

      const fileName = file.name;

      if (file.size > availableFileSize) {
        setFileStatus((prev) => ({ ...prev, sizeError: true }));
        return;
      }

      if (!file.type.startsWith('image/')) {
        setFileStatus((prev) => ({ ...prev, typeError: true }));
        return;
      }

      const fileUrl = await uploadImage(file);
      setTextAreaValue(
        (prevValue) => `${prevValue}![${fileName}](${fileUrl.fileUrl})`,
      );
    }
  };

  const onSubmit = async () => {
    const bodyData = {
      title: titleInput,
      contents: textAreaValue,
      // authorId: authorId,
      authorId: 1,
      assigneeIds: selections.assignees,
      labelIds: selections.labels,
      milestoneId: selections.milestones,
    };

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/issues/new`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bodyData),
        },
      );

      if (!response.ok) {
        throw new Error('HTTP error ' + response.status);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('이슈가 정상적으로 등록되지 않았습니다.');
    } finally {
      // navigate('/'); 보내버리면 안댐.
    }
  };

  useEffect(() => {
    if (textAreaValue) {
      setIsDisplayingCount(true);
      const timer = setTimeout(() => setIsDisplayingCount(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [textAreaValue]); // >> textArea로.

  const onMultipleSelectedAssignee = (id: number) => {
    setSelections((prev) => ({
      ...prev,
      assignees: prev.assignees.includes(id)
        ? prev.assignees.filter((itemId) => itemId !== id)
        : [...prev.assignees, id],
    }));
  };

  const onMultipleSelectedLabel = (id: number) => {
    setSelections((prev) => ({
      ...prev,
      labels: prev.labels.includes(id)
        ? prev.labels.filter((itemId) => itemId !== id)
        : [...prev.labels, id],
    }));
  };

  const onSingleSelectedMilestone = (id: number) => {
    setSelections((prev) => ({
      ...prev,
      milestones: prev.milestones.includes(id) ? [] : [id],
    }));
  };

  const onChange = (value: string) => {
    setTitleInput(value);
  };

  const onChangeTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextAreaValue(e.target.value);
  };

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      <Title />
      <Body>
        <UserImageContainer>
          <UserImage image={userImage} />
        </UserImageContainer>
        <InputContainer>
          <TextInput
            value={titleInput}
            label="제목"
            inputType="text"
            placeholder="제목"
            onChange={onChange}
            height={56}
          />
          <TextArea
            letterCount={textAreaValue.length}
            textAreaValue={textAreaValue}
            isDisplayingCount={isDisplayingCount}
            isFileUploading={fileStatus.isUploading}
            isFileTypeError={fileStatus.typeError}
            isFileSizeError={fileStatus.sizeError}
            isFileUploadFailed={fileStatus.uploadFailed}
            onFileChange={onFileChange}
            onChangeTextArea={onChangeTextArea}
          />
        </InputContainer>
        <SideBar>
          <ListSideBar
            onSingleSelectedMilestone={onSingleSelectedMilestone}
            onMultipleSelectedAssignee={onMultipleSelectedAssignee}
            onMultipleSelectedLabel={onMultipleSelectedLabel}
            selectedAssignees={selections.assignees}
            selectedLabels={selections.labels}
            selectedMilestones={selections.milestones}
          />
        </SideBar>
      </Body>
      <ButtonContainer>
        <Button
          typeVariant="ghost"
          size="M"
          onClick={() => {
            navigate('/');
          }}
        >
          <XSquare stroke={theme.neutral.text.default} />
          작성취소
        </Button>
        <Button
          typeVariant="contained"
          size="L"
          disabled={titleInput === ''}
          onClick={onSubmit}
        >
          완료
        </Button>
      </ButtonContainer>
    </div>
  );
};
