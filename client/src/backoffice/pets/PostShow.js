import { useShowController } from 'ra-core';
import * as React from 'react';
import {
    ArrayField,
    BooleanField,
    CloneButton,
    ChipField,
    Datagrid,
    DateField,
    EditButton,
    NumberField,
    ReferenceArrayField,
    ReferenceManyField,
    RichTextField,
    SelectField,
    ShowView,
    SingleFieldList,
    Tab,
    TabbedShowLayout,
    TextField,
    UrlField,
} from 'react-admin'; // eslint-disable-line import/no-unresolved
import { Link } from 'react-router-dom';
import Button from '@material-ui/core/Button';
// import PostTitle from './PostTitle';

const CreateRelatedComment = ({ record }) => (
    <Button
        component={Link}
        to={{
            pathname: '/comments/create',
            state: { record: { post_id: record.id } },
        }}
    >
        Add comment
    </Button>
);

const PostShow = props => {
    const controllerProps = useShowController(props);
    return (
        <ShowView {...controllerProps} title="Restaurant Show">
            <TabbedShowLayout>
                <Tab label="Summary">
                    <TextField source="name"/>
                    <TextField source="description" />
                    <TextField source="price" />
                    <TextField source="quantity" />
                    <DateField
                        source="createdAt"
                        sortByOrder="DESC"
                    />
                    <BooleanField source="isApproved"/>
                </Tab>
                <Tab label="Images">
                    <p>hello</p>
                </Tab>
            </TabbedShowLayout>
        </ShowView>
    );
};

export default PostShow;
